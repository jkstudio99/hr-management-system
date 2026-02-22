# 03 — Database Architecture

> Enterprise HR Management System — Prisma Schema & ER Diagram
> Last updated: 2026-02-22

---

## 1. Overview

ฐานข้อมูลใช้ **PostgreSQL** ผ่าน **Prisma ORM** ประกอบด้วย **32 Models** ครอบคลุม 14 โดเมนหลัก:

| Domain                | Models                                     | Description                   |
| --------------------- | ------------------------------------------ | ----------------------------- |
| **Identity & Access** | User, Role                                 | ระบบผู้ใช้และสิทธิ์การเข้าถึง |
| **Organization**      | Department, JobTitle, Employee, JobHistory | โครงสร้างองค์กร + ประวัติ     |
| **Leave Management**  | LeaveRequest                               | ระบบจัดการวันลา               |
| **Asset Management**  | Asset                                      | ระบบจัดการทรัพย์สิน           |
| **Finance**           | ExpenseClaim, PayrollRun, PayrollItem      | เบิกค่าใช้จ่าย + เงินเดือน    |
| **Performance**       | PerformanceReview                          | ระบบประเมินผลงาน              |
| **Off-boarding**      | ExitChecklist                              | ระบบ Offboarding              |
| **Notifications**     | Notification                               | แจ้งเตือน + contract expiry   |
| **Surveys**           | Survey, SurveyQuestion, SurveyResponse     | Pulse surveys                 |
| **Audit**             | AuditLog                                   | บันทึก audit trail            |
| **Overtime**          | OvertimeRequest, TimesheetEntry            | OT + บันทึกเวลา               |
| **Recruitment**       | JobPosting, Applicant                      | สรรหาบุคลากร (ATS)            |
| **Training**          | TrainingCourse, TrainingEnrollment         | อบรม + พัฒนา                  |
| **Documents**         | Document                                   | จัดการเอกสาร HR               |
| **Benefits**          | BenefitPlan, EmployeeBenefit               | สวัสดิการ                     |
| **Scheduling**        | Shift, ShiftAssignment                     | จัดตารางกะ                    |
| **Goals**             | Goal, KeyResult                            | KPI / OKR                     |
| **Announcements**     | Announcement                               | ประกาศภายใน                   |

---

## 2. Entity Relationship Diagram (Text)

```
┌──────────┐       ┌──────────┐
│   Role   │──1:N──│   User   │
└──────────┘       └────┬─────┘
                        │ 1:1 (optional)
                   ┌────▼─────┐
                   │ Employee │──────────────────────────────────────┐
                   └──┬──┬────┘                                     │
                      │  │                                          │
          ┌───────────┘  └───────────┐                              │
          │                          │                              │
     ┌────▼──────┐           ┌───────▼────┐                         │
     │Department │           │  JobTitle  │                         │
     └───────────┘           └────────────┘                         │
                                                                    │
     ┌──────────────┬──────────────┬──────────────┬────────────────┤
     │              │              │              │                │
┌────▼────┐  ┌──────▼──────┐ ┌────▼────┐  ┌──────▼──────┐  ┌─────▼──────┐
│  Leave  │  │ Performance │ │  Asset  │  │   Expense   │  │    Exit    │
│ Request │  │   Review    │ │         │  │    Claim    │  │  Checklist │
└─────────┘  └─────────────┘ └─────────┘  └─────────────┘  └────────────┘
                                                                    │
                                                              ┌─────▼──────┐
                                                              │    Job     │
                                                              │  History   │
                                                              └────────────┘
```

---

## 3. Model Specifications

### 3.1 User (ผู้ใช้ระบบ)

| Column         | Type     | Constraints           | Description                        |
| -------------- | -------- | --------------------- | ---------------------------------- |
| `id`           | Int      | PK, Auto-increment    | รหัสผู้ใช้                         |
| `username`     | String   | Unique                | ชื่อผู้ใช้สำหรับล็อคอิน            |
| `passwordHash` | String   | Required              | รหัสผ่านที่ผ่าน Bcrypt (12 rounds) |
| `email`        | String   | Unique                | อีเมล                              |
| `isActive`     | Boolean  | Default: true         | สถานะการใช้งาน                     |
| `employeeId`   | Int?     | Unique, FK → Employee | เชื่อมโยงกับพนักงาน (optional)     |
| `roleId`       | Int      | FK → Role             | บทบาทในระบบ                        |
| `createdAt`    | DateTime | Auto                  | วันที่สร้าง                        |
| `updatedAt`    | DateTime | Auto                  | วันที่แก้ไขล่าสุด                  |

**Table name:** `users`
**Relations:** Role (N:1), Employee (1:1 optional)

---

### 3.2 Role (บทบาท)

| Column     | Type   | Constraints        | Description                     |
| ---------- | ------ | ------------------ | ------------------------------- |
| `id`       | Int    | PK, Auto-increment | รหัสบทบาท                       |
| `roleName` | String | Unique             | ชื่อบทบาท (ADMIN, HR, EMPLOYEE) |

**Table name:** `roles`
**Relations:** Users (1:N)
**Seed Data:** ADMIN, HR, EMPLOYEE

---

### 3.3 Department (แผนก)

| Column           | Type   | Constraints        | Description |
| ---------------- | ------ | ------------------ | ----------- |
| `id`             | Int    | PK, Auto-increment | รหัสแผนก    |
| `departmentName` | String | Unique             | ชื่อแผนก    |

**Table name:** `departments`
**Relations:** Employees (1:N)
**Seed Data:** Engineering, Human Resources, Finance, Marketing, Operations

---

### 3.4 JobTitle (ตำแหน่งงาน)

| Column      | Type   | Constraints        | Description |
| ----------- | ------ | ------------------ | ----------- |
| `id`        | Int    | PK, Auto-increment | รหัสตำแหน่ง |
| `titleName` | String | Unique             | ชื่อตำแหน่ง |

**Table name:** `job_titles`
**Relations:** Employees (1:N)
**Seed Data:** Software Engineer, HR Manager, Accountant, Marketing Specialist, Operations Manager, Senior Developer, Junior Developer

---

### 3.5 Employee (พนักงาน) — Central Entity

| Column         | Type          | Constraints        | Description       |
| -------------- | ------------- | ------------------ | ----------------- |
| `id`           | Int           | PK, Auto-increment | รหัสพนักงาน       |
| `idCard`       | String        | Unique             | เลขบัตรประชาชน    |
| `firstName`    | String        | Required           | ชื่อ              |
| `lastName`     | String        | Required           | นามสกุล           |
| `departmentId` | Int           | FK → Department    | แผนกที่สังกัด     |
| `jobTitleId`   | Int           | FK → JobTitle      | ตำแหน่งงาน        |
| `hireDate`     | DateTime      | Required           | วันที่เริ่มงาน    |
| `baseSalary`   | Decimal(18,2) | Required           | เงินเดือนพื้นฐาน  |
| `isActive`     | Boolean       | Default: true      | สถานะการทำงาน     |
| `createdAt`    | DateTime      | Auto               | วันที่สร้าง       |
| `updatedAt`    | DateTime      | Auto               | วันที่แก้ไขล่าสุด |

**Table name:** `employees`
**Relations:**

- Department (N:1)
- JobTitle (N:1)
- User (1:1 optional, reverse)
- LeaveRequests (1:N)
- Assets (1:N)
- ExpenseClaims (1:N)
- PerformanceReviews (1:N, as Reviewee)
- ExitChecklists (1:N)
- JobHistories (1:N)

---

### 3.6 LeaveRequest (คำขอลา)

| Column       | Type     | Constraints        | Description                                |
| ------------ | -------- | ------------------ | ------------------------------------------ |
| `id`         | Int      | PK, Auto-increment | รหัสคำขอ                                   |
| `employeeId` | Int      | FK → Employee      | พนักงานที่ขอลา                             |
| `leaveType`  | String   | Required           | ประเภทการลา (ANNUAL, SICK, PERSONAL, etc.) |
| `startDate`  | DateTime | Required           | วันเริ่มลา                                 |
| `endDate`    | DateTime | Required           | วันสิ้นสุดการลา                            |
| `status`     | String   | Default: "PENDING" | สถานะ (PENDING, APPROVED, REJECTED)        |
| `approverId` | Int?     | Optional           | ผู้อนุมัติ                                 |

**Table name:** `leave_requests`
**Relations:** Employee (N:1)

---

### 3.7 Asset (ทรัพย์สิน)

| Column         | Type   | Constraints              | Description                          |
| -------------- | ------ | ------------------------ | ------------------------------------ |
| `id`           | Int    | PK, Auto-increment       | รหัสทรัพย์สิน                        |
| `assetName`    | String | Required                 | ชื่อทรัพย์สิน (เช่น MacBook Pro 16") |
| `serialNumber` | String | Unique                   | หมายเลขซีเรียล                       |
| `employeeId`   | Int?   | FK → Employee (optional) | ผู้ถือครอง                           |
| `status`       | String | Default: "AVAILABLE"     | สถานะ (AVAILABLE, ASSIGNED, RETIRED) |

**Table name:** `assets`
**Relations:** Employee (N:1, optional)

---

### 3.8 ExpenseClaim (การเบิกค่าใช้จ่าย)

| Column       | Type          | Constraints        | Description                               |
| ------------ | ------------- | ------------------ | ----------------------------------------- |
| `id`         | Int           | PK, Auto-increment | รหัสการเบิก                               |
| `employeeId` | Int           | FK → Employee      | พนักงานที่เบิก                            |
| `claimType`  | String        | Required           | ประเภท (MEDICAL, TRAVEL, EQUIPMENT, etc.) |
| `amount`     | Decimal(18,2) | Required           | จำนวนเงิน                                 |
| `receiptUrl` | String?       | Optional           | URL ใบเสร็จ                               |
| `status`     | String        | Default: "PENDING" | สถานะ (PENDING, APPROVED, REJECTED)       |

**Table name:** `expense_claims`
**Relations:** Employee (N:1)

---

### 3.9 PerformanceReview (การประเมินผลงาน)

| Column       | Type    | Constraints        | Description                          |
| ------------ | ------- | ------------------ | ------------------------------------ |
| `id`         | Int     | PK, Auto-increment | รหัสการประเมิน                       |
| `reviewerId` | Int     | Required           | ผู้ประเมิน (employee ID)             |
| `revieweeId` | Int     | FK → Employee      | ผู้ถูกประเมิน                        |
| `period`     | String  | Required           | ช่วงเวลา (เช่น "2025-H2", "2026-Q1") |
| `score`      | Int     | Required           | คะแนน (1-10)                         |
| `comments`   | String? | Optional           | ความคิดเห็น                          |

**Table name:** `performance_reviews`
**Relations:** Employee (N:1, as Reviewee)

---

### 3.10 ExitChecklist (รายการ Offboarding)

| Column        | Type    | Constraints        | Description                       |
| ------------- | ------- | ------------------ | --------------------------------- |
| `id`          | Int     | PK, Auto-increment | รหัสรายการ                        |
| `employeeId`  | Int     | FK → Employee      | พนักงานที่ลาออก                   |
| `itemName`    | String  | Required           | ชื่อรายการ (เช่น "Return laptop") |
| `isCompleted` | Boolean | Default: false     | สถานะการดำเนินการ                 |
| `clearedById` | Int?    | Optional           | ผู้ตรวจสอบ (employee ID)          |

**Table name:** `exit_checklists`
**Relations:** Employee (N:1)

---

### 3.11 JobHistory (ประวัติการเลื่อนตำแหน่ง)

| Column          | Type     | Constraints        | Description                |
| --------------- | -------- | ------------------ | -------------------------- |
| `id`            | Int      | PK, Auto-increment | รหัสประวัติ                |
| `employeeId`    | Int      | FK → Employee      | พนักงาน                    |
| `oldTitleId`    | Int      | Required           | ตำแหน่งเดิม (job title ID) |
| `newTitleId`    | Int      | Required           | ตำแหน่งใหม่ (job title ID) |
| `effectiveDate` | DateTime | Required           | วันที่มีผล                 |

**Table name:** `job_histories`
**Relations:** Employee (N:1)

---

## 4. Indexes & Constraints Summary

| Model             | Unique Constraints                | Foreign Keys                                         |
| ----------------- | --------------------------------- | ---------------------------------------------------- |
| User              | `username`, `email`, `employeeId` | `roleId` → Role, `employeeId` → Employee             |
| Role              | `roleName`                        | —                                                    |
| Department        | `departmentName`                  | —                                                    |
| JobTitle          | `titleName`                       | —                                                    |
| Employee          | `idCard`                          | `departmentId` → Department, `jobTitleId` → JobTitle |
| LeaveRequest      | —                                 | `employeeId` → Employee                              |
| Asset             | `serialNumber`                    | `employeeId` → Employee                              |
| ExpenseClaim      | —                                 | `employeeId` → Employee                              |
| PerformanceReview | —                                 | `revieweeId` → Employee                              |
| ExitChecklist     | —                                 | `employeeId` → Employee                              |
| JobHistory        | —                                 | `employeeId` → Employee                              |

---

## 5. Future Schema Extensions (Planned)

เมื่อพัฒนาโมดูลเพิ่มเติม จะต้องเพิ่ม models/fields ต่อไปนี้:

### 5.1 Contract & Document Expiry (Module 6)

```prisma
// เพิ่มใน Employee model:
contractStartDate  DateTime?
contractEndDate    DateTime?
idCardExpiry       DateTime?
workPermitExpiry   DateTime?

// เพิ่ม model ใหม่:
model Notification {
  id          Int      @id @default(autoincrement())
  userId      Int
  title       String
  message     String
  isRead      Boolean  @default(false)
  createdAt   DateTime @default(now())
}
```

### 5.2 Pulse Surveys (Module 13)

```prisma
model Survey {
  id          Int               @id @default(autoincrement())
  title       String
  isActive    Boolean           @default(true)
  startDate   DateTime
  endDate     DateTime
  questions   SurveyQuestion[]
  createdAt   DateTime          @default(now())
}

model SurveyQuestion {
  id        Int              @id @default(autoincrement())
  surveyId  Int
  survey    Survey           @relation(fields: [surveyId], references: [id])
  question  String
  type      String           // RATING, TEXT, MULTIPLE_CHOICE
  responses SurveyResponse[]
}

model SurveyResponse {
  id         Int            @id @default(autoincrement())
  questionId Int
  question   SurveyQuestion @relation(fields: [questionId], references: [id])
  answer     String
  createdAt  DateTime       @default(now())
  // ไม่มี employeeId — Anonymous
}
```

### 5.3 2FA Security (Module 14)

```prisma
// เพิ่มใน User model:
twoFactorSecret    String?
isTwoFactorEnabled Boolean @default(false)
```

### 5.4 Payroll (Module 15)

```prisma
model PayrollRun {
  id          Int           @id @default(autoincrement())
  period      String        // "2026-02"
  status      String        @default("DRAFT") // DRAFT, PROCESSING, COMPLETED
  totalAmount Decimal       @db.Decimal(18, 2)
  items       PayrollItem[]
  createdAt   DateTime      @default(now())
}

model PayrollItem {
  id           Int        @id @default(autoincrement())
  payrollRunId Int
  payrollRun   PayrollRun @relation(fields: [payrollRunId], references: [id])
  employeeId   Int
  baseSalary   Decimal    @db.Decimal(18, 2)
  deductions   Decimal    @db.Decimal(18, 2)
  netPay       Decimal    @db.Decimal(18, 2)
}
```

---

## 6. Migration History

| Migration | Date       | Description                |
| --------- | ---------- | -------------------------- |
| `init`    | 2026-02-22 | Initial schema — 11 models |

**Commands:**

```bash
# สร้าง migration ใหม่
npx prisma migrate dev --name <name>

# รัน seed
npx prisma db seed

# เปิด Prisma Studio (GUI)
npx prisma studio

# Generate Prisma Client
npx prisma generate
```
