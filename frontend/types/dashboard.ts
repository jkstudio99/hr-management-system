// ── Dashboard Types ───────────────────────────────────────────────────────────

export interface DashboardHeadcount {
  total: number
  active: number
  inactive: number
  turnoverRate: number
}

export interface DashboardPendingApprovals {
  leaveRequests: number
  expenseClaims: number
}

export interface DashboardAssets {
  total: number
  assigned: number
  available: number
}

export interface DashboardStats {
  headcount: DashboardHeadcount
  departments: number
  pendingApprovals: DashboardPendingApprovals
  assets: DashboardAssets
}

export interface DeptStat {
  id: number
  name: string
  headcount: number
}

export interface LeaveStat {
  status: string
  count: number
}

export interface PayrollStat {
  department: string
  totalSalary: number
}
