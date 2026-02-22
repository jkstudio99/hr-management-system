// ─────────────────────────────────────────────────────────────────────────────
// services/dashboard.service.ts
// GET /api/dashboard/stats | /departments | /leaves | /payroll
// ─────────────────────────────────────────────────────────────────────────────
import type { ApiFetch } from './http'
import type { DashboardStats, DeptStat, LeaveStat, PayrollStat } from '~/types/dashboard'

export const createDashboardService = (fetch: ApiFetch) => ({
  stats: () => fetch<DashboardStats>('/dashboard/stats'),
  departmentStats: () => fetch<DeptStat[]>('/dashboard/departments'),
  leaveStats: () => fetch<LeaveStat[]>('/dashboard/leaves'),
  payrollByDept: () => fetch<PayrollStat[]>('/dashboard/payroll'),
})

export type DashboardService = ReturnType<typeof createDashboardService>
