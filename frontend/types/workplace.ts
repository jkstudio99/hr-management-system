// ── Workplace Types ───────────────────────────────────────────────────────────
import type { Employee } from './employee'

export interface Document {
  id: number
  title: string
  category: string
  fileUrl: string
  expiryDate?: string
  employeeId?: number
  employee?: Employee
  createdAt: string
}

export interface BenefitPlan {
  id: number
  name: string
  type: string
  description?: string
  isActive: boolean
  _count?: { employees: number }
}

export interface BenefitEnrollment {
  id: number
  planId: number
  employeeId: number
  startDate: string
  endDate?: string
  isActive: boolean
  employee?: Employee
  plan?: BenefitPlan
}

export interface Shift {
  id: number
  name: string
  startTime: string
  endTime: string
  color?: string
  isActive: boolean
}

export interface ShiftAssignment {
  id: number
  shiftId: number
  employeeId: number
  date: string
  note?: string
  shift?: Shift
  employee?: Employee
}

export interface Announcement {
  id: number
  title: string
  content: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  isPinned: boolean
  isArchived: boolean
  publishedAt: string
  createdAt: string
}
