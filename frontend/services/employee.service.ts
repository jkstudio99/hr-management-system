// ─────────────────────────────────────────────────────────────────────────────
// services/employee.service.ts
// ─────────────────────────────────────────────────────────────────────────────
import type { ApiFetch, buildQuery } from "./http";
import type { PaginatedResponse } from "~/types/common";
import type {
  Employee,
  Department,
  JobTitle,
  JobHistory,
  ExitChecklist,
} from "~/types/employee";

export const createEmployeeService = (
  fetch: ApiFetch,
  query: typeof buildQuery,
) => ({
  // ── Employees ──────────────────────────────────────────────────────────────
  employees: {
    list: (params?: Record<string, any>) =>
      fetch<PaginatedResponse<Employee>>(`/employees${query(params)}`),
    get: (id: number) => fetch<Employee>(`/employees/${id}`),
    create: (body: Partial<Employee>) =>
      fetch<Employee>("/employees", { method: "POST", body }),
    update: (id: number, body: Partial<Employee>) =>
      fetch<Employee>(`/employees/${id}`, { method: "PATCH", body }),
    remove: (id: number) =>
      fetch<void>(`/employees/${id}`, { method: "DELETE" }),
  },

  // ── Departments ────────────────────────────────────────────────────────────
  departments: {
    list: () => fetch<Department[]>("/departments"),
    get: (id: number) => fetch<Department>(`/departments/${id}`),
    create: (body: { departmentName: string }) =>
      fetch<Department>("/departments", { method: "POST", body }),
    update: (id: number, body: { departmentName: string }) =>
      fetch<Department>(`/departments/${id}`, { method: "PATCH", body }),
    remove: (id: number) =>
      fetch<void>(`/departments/${id}`, { method: "DELETE" }),
  },

  // ── Job Titles ─────────────────────────────────────────────────────────────
  jobTitles: {
    list: () => fetch<JobTitle[]>("/job-titles"),
    create: (body: { titleName: string }) =>
      fetch<JobTitle>("/job-titles", { method: "POST", body }),
    update: (id: number, body: { titleName: string }) =>
      fetch<JobTitle>(`/job-titles/${id}`, { method: "PATCH", body }),
    remove: (id: number) =>
      fetch<void>(`/job-titles/${id}`, { method: "DELETE" }),
  },

  // ── Job Histories ──────────────────────────────────────────────────────────
  jobHistories: {
    list: (params?: Record<string, any>) =>
      fetch<PaginatedResponse<JobHistory>>(`/job-histories${query(params)}`),
    create: (body: Partial<JobHistory>) =>
      fetch<JobHistory>("/job-histories", { method: "POST", body }),
    update: (id: number, body: Partial<JobHistory>) =>
      fetch<JobHistory>(`/job-histories/${id}`, { method: "PATCH", body }),
  },

  // ── Exit Checklists ────────────────────────────────────────────────────────
  exitChecklists: {
    list: (params?: Record<string, any>) =>
      fetch<PaginatedResponse<ExitChecklist>>(
        `/exit-checklists${query(params)}`,
      ),
    generate: (employeeId: number) =>
      fetch<ExitChecklist[]>(`/exit-checklists/generate/${employeeId}`, {
        method: "POST",
        body: {},
      }),
    update: (id: number, body: Partial<ExitChecklist>) =>
      fetch<ExitChecklist>(`/exit-checklists/${id}`, { method: "PATCH", body }),
  },

  // ── Org Chart ──────────────────────────────────────────────────────────────
  orgChart: {
    tree: () => fetch<any[]>("/org-chart/tree"),
    subordinates: (employeeId: number) =>
      fetch<any[]>(`/org-chart/${employeeId}/subordinates`),
    setManager: (employeeId: number, managerId: number | null) =>
      fetch<any>(`/org-chart/${employeeId}/manager`, {
        method: "PATCH",
        body: { managerId },
      }),
  },
});

export type EmployeeService = ReturnType<typeof createEmployeeService>;
