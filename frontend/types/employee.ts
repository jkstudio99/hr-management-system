// ── Employee Domain Types ─────────────────────────────────────────────────────

export interface Department {
  id: number
  departmentName: string
  _count?: { employees: number }
}

export interface JobTitle {
  id: number
  titleName: string
  _count?: { employees: number }
}

export interface Employee {
  id: number
  firstName: string
  lastName: string
  email: string
  phone?: string
  idCard?: string
  baseSalary?: number
  isActive: boolean
  departmentId?: number
  jobTitleId?: number
  managerId?: number
  department?: Department
  jobTitle?: JobTitle
  createdAt: string
  updatedAt: string
}

export interface JobHistory {
  id: number
  employeeId: number
  changeType: string
  description: string
  effectiveDate: string
  employee?: Employee
}

export interface ExitChecklist {
  id: number
  employeeId: number
  taskName: string
  isCompleted: boolean
  employee?: Employee
}
