import { CreateButton } from "@/components/refine-ui/buttons/create";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { ListView } from "@/components/refine-ui/views/list-view";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClassDetails, Subject, User } from "@/types";
import { useList } from "@refinedev/core";
import { useTable } from "@refinedev/react-table";
import { ColumnDef } from "@tanstack/react-table";

import { Search } from "lucide-react";
import { useMemo, useRef, useState } from "react";

const ClassesList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedTeacher, setSelectedTeacher] = useState("all");
  const searchTimeoutRef = useRef<number | null>(null);

  // Fetch subjects for filter
  const { query: subjectsQuery } = useList<Subject>({
    resource: "subjects",
    pagination: { pageSize: 100 },
  });

  // Fetch teachers for filter
  const { query: teachersQuery } = useList<User>({
    resource: "users",
    filters: [{ field: "role", operator: "eq", value: "teacher" }],
    pagination: { pageSize: 100 },
  });

  const subjects = subjectsQuery?.data?.data || [];
  const teachers = teachersQuery?.data?.data || [];

  const subjectFilter =
    selectedSubject === "all"
      ? []
      : [
          {
            field: "subject",
            operator: "eq" as const,
            value: selectedSubject,
          },
        ];

  const teacherFilter =
    selectedTeacher === "all"
      ? []
      : [
          {
            field: "teacher",
            operator: "eq" as const,
            value: selectedTeacher,
          },
        ];

  const searchFilters = searchQuery
    ? [
        {
          field: "name",
          operator: "contains" as const,
          value: searchQuery,
        },
      ]
    : [];

  const classTable = useTable<ClassDetails>({
    columns: useMemo<ColumnDef<ClassDetails>[]>(
      () => [
        {
          id: "bannerUrl",
          accessorKey: "bannerUrl",
          header: () => <p className="column-title ml-2">Banner</p>,
          cell: ({ getValue }) => {
            const url = getValue<string>();
            return (
              <div className="ml-2 w-12 h-12 rounded overflow-hidden">
                <img
                  src={url || "/favicon.ico"}
                  alt="Class Banner"
                  className="w-full h-full object-cover"
                />
              </div>
            );
          },
        },
        {
          id: "name",
          accessorKey: "name",
          header: () => <p className="column-title ml-2">Class Name</p>,
          cell: ({ getValue }) => (
            <span className="font-medium ml-2">{getValue<string>()}</span>
          ),
        },
        {
          id: "status",
          accessorKey: "status",
          header: () => <p className="column-title">Status</p>,
          cell: ({ getValue }) => {
            const status = getValue<string>();
            return (
              <Badge variant={status === "active" ? "default" : "secondary"}>
                {status}
              </Badge>
            );
          },
        },
        {
          id: "subject",
          accessorFn: (row) => row.subject?.name ?? "N/A",
          header: () => <p className="column-title">Subject</p>,
          cell: ({ getValue }) => <span>{getValue<string>()}</span>,
        },
        {
          id: "teacher",
          accessorFn: (row) => row.teacher?.name ?? "N/A",
          header: () => <p className="column-title">Teacher</p>,
          cell: ({ getValue }) => <span>{getValue<string>()}</span>,
        },
        {
          id: "capacity",
          accessorKey: "capacity",
          header: () => <p className="column-title">Capacity</p>,
          cell: ({ getValue }) => <span>{getValue<number>()}</span>,
        },
      ],
      [],
    ),
    refineCoreProps: {
      resource: "classes",
      pagination: {
        pageSize: 10,
        mode: "server",
      },
      filters: {
        permanent: [...subjectFilter, ...teacherFilter, ...searchFilters],
      },
      sorters: {
        initial: [
          {
            field: "id",
            order: "desc",
          },
        ],
      },
    },
  });

  return (
    <ListView>
      <Breadcrumb />
      <h1 className="page-title">Classes</h1>

      <div className="intro-row">
        <p>Manage your classroom sections, assign teachers and subjects.</p>
        <div className="actions-row">
          <div className="search-field">
            <Search className="search-icon" />

            <Input
              type="text"
              placeholder="Search by class name.."
              className="pl-10 w-full"
              defaultValue=""
              onChange={(event) => {
                if (searchTimeoutRef.current) {
                  window.clearTimeout(searchTimeoutRef.current);
                }

                const nextValue = event.target.value;

                searchTimeoutRef.current = window.setTimeout(() => {
                  setSearchQuery(nextValue.trim());
                }, 300);
              }}
            />
          </div>
          <div className="flex flex-wrap gap-2 w-full lg:flex-nowrap">
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-full lg:w-[200px]">
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.name}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
              <SelectTrigger className="w-full lg:w-[200px]">
                <SelectValue placeholder="All Teachers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teachers</SelectItem>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.name}>
                    {teacher.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <CreateButton resource="classes" />
          </div>
        </div>
      </div>

      <DataTable table={classTable} />
    </ListView>
  );
};

export default ClassesList;
