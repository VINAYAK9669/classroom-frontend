"use client";

import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { CreateView } from "@/components/refine-ui/views/create-view";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { subjects, teachers } from "@/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { type BaseRecord, type HttpError } from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";
import { type Resolver } from "react-hook-form";
import * as z from "zod";
import UploadWidget from "@/components/UploadWidget";
import type { UploadWidgetValue } from "@/types";
import { useState } from "react";

const createClassFormSchema = z.object({
  bannerUrl: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || /^https?:\/\/\S+$/i.test(value), {
      message: "Banner image must be a valid URL",
    }),
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
    .min(1, "Teacher is required"),
  capacity: z.coerce
    .number({
      required_error: "Capacity is required",
      invalid_type_error: "Capacity is required",
    })
    .int("Capacity must be a whole number")
    .min(1, "Capacity must be at least 1")
    .max(500, "Capacity must be less than or equal to 500"),
  status: z.enum(["active", "inactive"], {
    required_error: "Status is required",
  }),
  description: z
    .string({ required_error: "Description is required" })
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must be at most 500 characters"),
});

type CreateClassFormValues = z.infer<typeof createClassFormSchema>;

const getBannerPublicId = (url: string) => {
  try {
    const path = new URL(url).pathname.replace(/^\/+/, "");
    const normalized = (path || "classes/banner-image")
      .replace(/[^A-Za-z0-9/_-]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 255);

    return normalized.length >= 3 ? normalized : "classes/banner-image";
  } catch {
    return "classes/banner-image";
  }
};

const Create = () => {
  const [bannerAsset, setBannerAsset] = useState<UploadWidgetValue | null>(
    null,
  );

  const form = useForm<BaseRecord, HttpError, CreateClassFormValues>({
    resolver: zodResolver(
      createClassFormSchema,
    ) as Resolver<CreateClassFormValues>,
    refineCoreProps: {
      resource: "classes",
      action: "create",
    },
    defaultValues: {
      description: "",
      subjectId: undefined,
      teacherId: "",
      capacity: 30,
      status: "active",
      bannerUrl: "",
    },
  });

  const { onFinish } = form.refineCore;
  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (values: CreateClassFormValues) => {
    const selectedSubject = subjects.find(
      (item) => item.id === values.subjectId,
    );
    const selectedTeacher = teachers.find(
      (item) => item.id === values.teacherId,
    );
    const normalizedBannerUrl = values.bannerUrl?.trim();
    const finalBannerUrl =
      normalizedBannerUrl && normalizedBannerUrl.length > 0
        ? normalizedBannerUrl
        : "https://images.unsplash.com/photo-1523240795612-9a054b0db644";

    await (onFinish as (payload: BaseRecord) => Promise<unknown>)({
      ...values,
      bannerUrl: finalBannerUrl,
      name: `${selectedSubject?.name ?? "General"} - ${
        selectedTeacher?.name ?? "Class"
      }`,
      bannerCldPubId:
        bannerAsset?.publicId ?? getBannerPublicId(finalBannerUrl),
      inviteCode: undefined,
      schedules: undefined,
    });
  };

  return (
    <CreateView className="class-view class-create-page">
      <Breadcrumb />
      <h1 className="page-title">Create a Class</h1>
      <Separator />

      <div className="class-create-shell">
        <Form {...form}>
          <form id="class-create-form" onSubmit={handleSubmit(onSubmit)}>
            <Card className="class-form-card w-full max-w-3xl">
              <CardHeader>
                <CardTitle className="text-xl font-bold">
                  Design the class experience
                </CardTitle>
              </CardHeader>
              <Separator />

              <CardContent className="mt-6 space-y-5">
                <FormField
                  control={control}
                  name="bannerUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground data-[error=true]:text-foreground">
                        Banner Image
                      </FormLabel>
                      <FormControl>
                        <UploadWidget
                          value={
                            field.value
                              ? {
                                  url: field.value,
                                  publicId: bannerAsset?.publicId ?? "",
                                }
                              : null
                          }
                          onChange={(file) => {
                            if (file) {
                              setBannerAsset(file);
                              field.onChange(file.url);
                              return;
                            }

                            setBannerAsset(null);
                            field.onChange("");
                          }}
                        />
                      </FormControl>
                      <FormMessage className="min-h-5 text-rose-600 dark:text-rose-400" />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={control}
                    name="subjectId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground data-[error=true]:text-foreground">
                          Subject<span className="required-mark">*</span>
                        </FormLabel>
                        <Select
                          value={
                            typeof field.value === "number"
                              ? String(field.value)
                              : undefined
                          }
                          onValueChange={(value) =>
                            field.onChange(Number(value))
                          }
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select subject" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {subjects.map((subject) => (
                              <SelectItem
                                key={subject.id}
                                value={String(subject.id)}
                              >
                                {subject.name} ({subject.code})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="min-h-5 text-rose-600 dark:text-rose-400" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="teacherId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground data-[error=true]:text-foreground">
                          Teacher<span className="required-mark">*</span>
                        </FormLabel>
                        <Select
                          value={field.value || undefined}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select teacher" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {teachers.map((teacher) => (
                              <SelectItem key={teacher.id} value={teacher.id}>
                                {teacher.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="min-h-5 text-rose-600 dark:text-rose-400" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={control}
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground data-[error=true]:text-foreground">
                          Capacity<span className="required-mark">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min={1}
                            max={500}
                            step={1}
                            placeholder="30"
                            onChange={(event) =>
                              field.onChange(event.target.value)
                            }
                          />
                        </FormControl>
                        <FormMessage className="min-h-5 text-rose-600 dark:text-rose-400" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground data-[error=true]:text-foreground">
                          Status<span className="required-mark">*</span>
                        </FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="min-h-5 text-rose-600 dark:text-rose-400" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground data-[error=true]:text-foreground">
                        Description<span className="required-mark">*</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          value={field.value ?? ""}
                          rows={5}
                          maxLength={500}
                          placeholder="Provide a concise class summary, objective, and prerequisites."
                        />
                      </FormControl>
                      <FormDescription className="text-right">
                        {field.value?.length ?? 0}/500
                      </FormDescription>
                      <FormMessage className="min-h-5 text-rose-600 dark:text-rose-400" />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end pt-1">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create Class"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </Form>
      </div>
    </CreateView>
  );
};

export default Create;
