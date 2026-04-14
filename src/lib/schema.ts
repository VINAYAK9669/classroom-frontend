import * as z from "zod";

export const facultySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "teacher", "student"], {
    required_error: "Please select a role",
  }),
  department: z.string(),
  image: z.string().optional(),
  imageCldPubId: z.string().optional(),
});

export const subjectSchema = z.object({
  name: z.string().min(3, "Subject name must be at least 3 characters"),
  code: z.string().min(5, "Subject code must be at least 5 characters"),
  description: z
    .string()
    .min(5, "Subject description must be at least 5 characters"),
  department: z
    .string()
    .min(2, "Subject department must be at least 2 characters"),
});

const HH_MM_24_HOUR_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;
const CLASS_NAME_REGEX = /^[A-Za-z0-9][A-Za-z0-9\s\-()&]*$/;
const TEACHER_ID_REGEX = /^[A-Za-z0-9_-]+$/;
const CLOUDINARY_PUBLIC_ID_REGEX = /^[A-Za-z0-9/_-]+$/;
const INVITE_CODE_REGEX = /^[A-Z0-9]{6,12}$/;

const scheduleSchema = z
  .object({
    day: z.enum(
      [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ],
      {
        required_error: "Day is required",
      },
    ),
    startTime: z
      .string({ required_error: "Start time is required" })
      .regex(HH_MM_24_HOUR_REGEX, "Start time must be in HH:MM format"),
    endTime: z
      .string({ required_error: "End time is required" })
      .regex(HH_MM_24_HOUR_REGEX, "End time must be in HH:MM format"),
  })
  .superRefine((value, ctx) => {
    if (value.startTime >= value.endTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endTime"],
        message: "End time must be later than start time",
      });
    }
  });

export const classSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Class name must be at least 2 characters")
    .max(50, "Class name must be at most 50 characters")
    .regex(
      CLASS_NAME_REGEX,
      "Class name can only include letters, numbers, spaces, -, (), and &",
    ),
  description: z
    .string({ required_error: "Description is required" })
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must be at most 500 characters"),
  subjectId: z.coerce
    .number({
      required_error: "Subject is required",
      invalid_type_error: "Subject is required",
    })
    .int("Subject is required")
    .min(1, "Subject is required"),
  teacherId: z
    .string({ required_error: "Teacher is required" })
    .trim()
    .min(1, "Teacher is required")
    .regex(TEACHER_ID_REGEX, "Teacher is invalid"),
  capacity: z.coerce
    .number({
      required_error: "Capacity is required",
      invalid_type_error: "Capacity is required",
    })
    .int("Capacity must be a whole number")
    .min(1, "Capacity must be at least 1")
    .max(500, "Capacity must be less than or equal to 500"),
  status: z.enum(["active", "inactive"]),
  bannerUrl: z
    .string({ required_error: "Class banner is required" })
    .trim()
    .url("Class banner must be a valid URL"),
  bannerCldPubId: z
    .string({ required_error: "Banner reference is required" })
    .trim()
    .min(3, "Banner reference must be at least 3 characters")
    .max(255, "Banner reference must be at most 255 characters")
    .regex(CLOUDINARY_PUBLIC_ID_REGEX, "Banner reference format is invalid"),
  inviteCode: z.preprocess(
    (value) => {
      if (typeof value !== "string") {
        return value;
      }

      const normalized = value.trim().toUpperCase();
      return normalized === "" ? undefined : normalized;
    },
    z
      .string()
      .regex(
        INVITE_CODE_REGEX,
        "Invite code must be 6-12 uppercase letters or numbers",
      )
      .optional(),
  ),
  schedules: z
    .array(scheduleSchema)
    .max(7, "You can add up to 7 schedules")
    .optional()
    .superRefine((schedules, ctx) => {
      if (!schedules) {
        return;
      }

      const uniqueSlots = new Set<string>();
      schedules.forEach((schedule, index) => {
        const key = `${schedule.day}-${schedule.startTime}-${schedule.endTime}`;

        if (uniqueSlots.has(key)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [index, "startTime"],
            message: "Duplicate schedule entry",
          });
          return;
        }

        uniqueSlots.add(key);
      });
    }),
});

export const enrollmentSchema = z.object({
  classId: z.coerce
    .number({
      required_error: "Class ID is required",
      invalid_type_error: "Class ID is required",
    })
    .min(1, "Class ID is required"),
  studentId: z.string().min(1, "Student ID is required"),
});
