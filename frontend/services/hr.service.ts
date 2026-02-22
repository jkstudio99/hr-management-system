// ─────────────────────────────────────────────────────────────────────────────
// services/hr.service.ts — Leave, Assets, Performance, Expense, Payroll,
//                          Notifications, Surveys, Audit Log
// ─────────────────────────────────────────────────────────────────────────────
import type { ApiFetch, buildQuery } from "./http";
import type { PaginatedResponse } from "~/types/common";
import type {
  LeaveRequest,
  Asset,
  PerformanceReview,
  ExpenseClaim,
  PayrollRun,
  Notification,
  Survey,
  AuditLog,
} from "~/types/hr";

export const createHrService = (fetch: ApiFetch, query: typeof buildQuery) => ({
  // ── Leave Requests ─────────────────────────────────────────────────────────
  leaveRequests: {
    list: (params?: Record<string, any>) =>
      fetch<PaginatedResponse<LeaveRequest>>(`/leave-requests${query(params)}`),
    create: (body: Partial<LeaveRequest>) =>
      fetch<LeaveRequest>("/leave-requests", { method: "POST", body }),
    update: (id: number, body: Partial<LeaveRequest>) =>
      fetch<LeaveRequest>(`/leave-requests/${id}`, { method: "PATCH", body }),
    approve: (id: number) =>
      fetch<LeaveRequest>(`/leave-requests/${id}`, {
        method: "PATCH",
        body: { status: "APPROVED" },
      }),
    reject: (id: number) =>
      fetch<LeaveRequest>(`/leave-requests/${id}`, {
        method: "PATCH",
        body: { status: "REJECTED" },
      }),
    remove: (id: number) =>
      fetch<void>(`/leave-requests/${id}`, { method: "DELETE" }),
  },

  // ── Assets ─────────────────────────────────────────────────────────────────
  assets: {
    list: (params?: Record<string, any>) =>
      fetch<PaginatedResponse<Asset>>(`/assets${query(params)}`),
    create: (body: Partial<Asset>) =>
      fetch<Asset>("/assets", { method: "POST", body }),
    update: (id: number, body: Partial<Asset>) =>
      fetch<Asset>(`/assets/${id}`, { method: "PATCH", body }),
    remove: (id: number) => fetch<void>(`/assets/${id}`, { method: "DELETE" }),
  },

  // ── Performance Reviews ────────────────────────────────────────────────────
  performanceReviews: {
    list: (params?: Record<string, any>) =>
      fetch<PaginatedResponse<PerformanceReview>>(
        `/performance-reviews${query(params)}`,
      ),
    create: (body: Partial<PerformanceReview>) =>
      fetch<PerformanceReview>("/performance-reviews", {
        method: "POST",
        body,
      }),
    update: (id: number, body: Partial<PerformanceReview>) =>
      fetch<PerformanceReview>(`/performance-reviews/${id}`, {
        method: "PATCH",
        body,
      }),
    remove: (id: number) =>
      fetch<void>(`/performance-reviews/${id}`, { method: "DELETE" }),
  },

  // ── Expense Claims ─────────────────────────────────────────────────────────
  expenseClaims: {
    list: (params?: Record<string, any>) =>
      fetch<PaginatedResponse<ExpenseClaim>>(`/expense-claims${query(params)}`),
    create: (body: Partial<ExpenseClaim>) =>
      fetch<ExpenseClaim>("/expense-claims", { method: "POST", body }),
    approve: (id: number) =>
      fetch<ExpenseClaim>(`/expense-claims/${id}`, {
        method: "PATCH",
        body: { status: "APPROVED" },
      }),
    reject: (id: number) =>
      fetch<ExpenseClaim>(`/expense-claims/${id}`, {
        method: "PATCH",
        body: { status: "REJECTED" },
      }),
    remove: (id: number) =>
      fetch<void>(`/expense-claims/${id}`, { method: "DELETE" }),
  },

  // ── Payroll ────────────────────────────────────────────────────────────────
  payroll: {
    list: (params?: Record<string, any>) =>
      fetch<PaginatedResponse<PayrollRun>>(`/payroll${query(params)}`),
    create: (body: { month: number; year: number }) =>
      fetch<PayrollRun>("/payroll", { method: "POST", body }),
    process: (id: number) =>
      fetch<PayrollRun>(`/payroll/${id}/process`, { method: "POST", body: {} }),
    complete: (id: number) =>
      fetch<PayrollRun>(`/payroll/${id}/complete`, {
        method: "POST",
        body: {},
      }),
    remove: (id: number) => fetch<void>(`/payroll/${id}`, { method: "DELETE" }),
  },

  // ── Notifications ──────────────────────────────────────────────────────────
  notifications: {
    list: () => fetch<PaginatedResponse<Notification>>("/notifications"),
    unreadCount: () => fetch<{ count: number }>("/notifications/unread-count"),
    markRead: (id: number) =>
      fetch<void>(`/notifications/${id}/read`, { method: "PATCH" }),
    markAllRead: () =>
      fetch<void>("/notifications/mark-all-read", { method: "POST", body: {} }),
    remove: (id: number) =>
      fetch<void>(`/notifications/${id}`, { method: "DELETE" }),
  },

  // ── Surveys ────────────────────────────────────────────────────────────────
  surveys: {
    list: (params?: Record<string, any>) =>
      fetch<PaginatedResponse<Survey>>(`/surveys${query(params)}`),
    get: (id: number) => fetch<Survey>(`/surveys/${id}`),
    create: (body: Partial<Survey>) =>
      fetch<Survey>("/surveys", { method: "POST", body }),
    update: (id: number, body: Partial<Survey>) =>
      fetch<Survey>(`/surveys/${id}`, { method: "PATCH", body }),
    remove: (id: number) => fetch<void>(`/surveys/${id}`, { method: "DELETE" }),
    respond: (
      id: number,
      body: { responses: Array<{ questionId: number; answer: string }> },
    ) => fetch<any>(`/surveys/${id}/respond`, { method: "POST", body }),
    results: (id: number) => fetch<any>(`/surveys/${id}/results`),
  },

  // ── Audit Log ──────────────────────────────────────────────────────────────
  auditLogs: {
    list: (params?: Record<string, any>) =>
      fetch<PaginatedResponse<AuditLog>>(`/audit-logs${query(params)}`),
  },
});

export type HrService = ReturnType<typeof createHrService>;
