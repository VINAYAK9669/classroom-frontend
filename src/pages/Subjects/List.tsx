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
import { DEPARTMENT_OPTIONS } from "@/constants";
import { Subject } from "@/types";
import { useTable } from "@refinedev/react-table";
import { ColumnDef } from "@tanstack/react-table";

import { Search } from "lucide-react";
import { useMemo, useRef, useState } from "react";

const SubjectsList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const searchTimeoutRef = useRef<number | null>(null);

  const departmentFilter =
    selectedDepartment === "all"
      ? []
      : [
          {
            field: "department",
            operator: "eq" as const,
            value: selectedDepartment,
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

  const subjectTable = useTable<Subject>({
    columns: useMemo<ColumnDef<Subject>[]>(
      () => [
        {
          id: "code",
          accessorKey: "code",
          size: 100,
          header: () => <p className="column-title ml-2">Code</p>,
          cell: ({ getValue }) => <Badge>{getValue<string>()}</Badge>,
        },
        {
          id: "name",
          accessorKey: "name",
          size: 200,
          header: () => <p className="column-title ml-2">Name</p>,
          cell: ({ getValue }) => <span>{getValue<string>()}</span>,
          filterFn: "includesString",
        },
        {
          id: "department",
          accessorFn: (row) =>
            typeof row.department === "string"
              ? row.department
              : row.department?.name ?? "",
          size: 150,
          header: () => <p className="column-title">Department</p>,
          cell: ({ getValue }) => (
            <Badge variant="secondary">{getValue<string>() || "N/A"}</Badge>
          ),
          filterFn: "includesString",
        },
        {
          id: "description",
          accessorKey: "description",
          size: 300,
          header: () => <p className="column-title">Description</p>,
          cell: ({ getValue }) => (
            <span className="truncate line-clamp-2">{getValue<string>()}</span>
          ),
          filterFn: "includesString",
        },
      ],
      [],
    ),
    refineCoreProps: {
      resource: "subjects",
      pagination: {
        pageSize: 10,
        mode: "server",
      },
      filters: {
        permanent: [...departmentFilter, ...searchFilters],
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
      <h1 className="page-title">Subjects</h1>

      <div className="intro-row">
        <p>Quick access to essential metrics and management tools.</p>
        <div className="actions-row">
          <div className="search-field">
            <Search className="search-icon" />

            <Input
              type="text"
              placeholder="Search by name.."
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
          <div className="flex gap-2 w-full">
            <Select
              value={selectedDepartment}
              onValueChange={setSelectedDepartment}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENT_OPTIONS.map((dept) => (
                  <SelectItem key={dept.value} value={dept.value}>
                    {dept.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <CreateButton />
          </div>
        </div>
      </div>

      <DataTable table={subjectTable} />
    </ListView>
  );
};

export default SubjectsList;
