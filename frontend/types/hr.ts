// ── HR Operations Types ───────────────────────────────────────────────────────
import type { Employee } from './employee'

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type LeaveType = 'ANNUAL' | 'SICK' | 'PERSONAL' | 'MATERNITY' | 'OTHER'
export type AssetStatus = 'AVAILABLE' | 'ASSIGNED' | 'RETIRED'
export type ExpenseStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type PayrollStatus = 'DRAFT' | 'PROCESSING' | 'COMPLETED'

export interface LeaveRequest {
  id: number
  employeeId: number
  leaveType: LeaveType
  startDate: string
  endDate: string
  reason?: string
  status: LeaveStatus
  employee?: Employee
  createdAt: string
}

export interface Asset {
  id: number
  assetName: string
  assetType: string
  serialNumber?: string
  status: AssetStatus
  employeeId?: number
  employee?: Employee
}

export interface PerformanceReview {
  id: number
  employeeId: number
  reviewerName: string
  reviewPeriod: string
  overallScore: number
  comments?: string
  reviewDate: string
  employee?: Employee
}

export interface ExpenseClaim {
  id: number
  employeeId: number
  title: string
  amount: number
  category: string
  description?: string
  status: ExpenseStatus
  employee?: Employee
  createdAt: string
}

export interface PayrollRun {
  id: number
  month: number
  year: number
  status: PayrollStatus
  _count?: { items: number }
  createdAt: string
}

export interface Notification {
  id: number
  title: string
  message: string
  isRead: boolean
  createdAt: string
}

export interface Survey {
  id: number
  title: string
  description?: string
  isActive: boolean
  startDate?: string
  endDate?: string
  _count?: { questions: number; responses: number }
}

export interface AuditLog {
  id: number
  username: string
  action: string
  entity: string
  entityId?: string
  createdAt: string
}
