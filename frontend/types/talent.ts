// ── Talent Management Types ───────────────────────────────────────────────────
import type { Employee } from './employee'

export type OvertimeStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type ApplicantStage = 'APPLIED' | 'SCREENING' | 'INTERVIEW' | 'OFFER' | 'HIRED' | 'REJECTED'

export interface OvertimeRequest {
  id: number
  employeeId: number
  date: string
  hours: number
  reason?: string
  status: OvertimeStatus
  employee?: Employee
  createdAt: string
}

export interface TimesheetEntry {
  id: number
  userId: number
  clockIn: string
  clockOut?: string
  date: string
}

export interface JobPosting {
  id: number
  title: string
  description: string
  requirements?: string
  location?: string
  salaryMin?: number
  salaryMax?: number
  status: string
  _count?: { applicants: number }
  createdAt: string
}

export interface Applicant {
  id: number
  name: string
  email: string
  phone?: string
  stage: ApplicantStage
  jobPostingId: number
  createdAt: string
}

export interface TrainingCourse {
  id: number
  title: string
  description?: string
  instructor?: string
  maxCapacity?: number
  isActive: boolean
  _count?: { enrollments: number }
}

export interface TrainingEnrollment {
  id: number
  courseId: number
  employeeId: number
  completedAt?: string
  employee?: Employee
  course?: TrainingCourse
}

export interface Goal {
  id: number
  employeeId: number
  title: string
  description?: string
  period: string
  status: string
  progress?: number
  employee?: Employee
  keyResults?: KeyResult[]
}

export interface KeyResult {
  id: number
  goalId: number
  title: string
  targetValue: number
  currentValue: number
  unit: string
}
