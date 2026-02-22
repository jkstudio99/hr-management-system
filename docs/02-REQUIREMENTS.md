# 02 — Requirements & Feature Specifications

> Enterprise HR Management System — Functional & Non-Functional Requirements
> Last updated: 2026-02-22

---

## 1. ภาพรวมระบบ (System Overview)

ระบบ Enterprise HR Management System ครอบคลุม **26 โมดูลหลัก** ที่ออกแบบมาเพื่อรองรับการทำงานของฝ่าย HR ตั้งแต่การจัดการข้อมูลพนักงาน ไปจนถึงระบบรักษาความปลอดภัยระดับองค์กร

---

## 2. Role-Based Access Control (RBAC)

| Role         | Description          | Access Level                                              |
| ------------ | -------------------- | --------------------------------------------------------- |
| **ADMIN**    | ผู้ดูแลระบบสูงสุด    | Full access ทุกโมดูล, จัดการ Users, ลบข้อมูล              |
| **HR**       | เจ้าหน้าที่ฝ่ายบุคคล | CRUD พนักงาน, อนุมัติวันลา, จัดการทรัพย์สิน, ประเมินผลงาน |
| **EMPLOYEE** | พนักงานทั่วไป        | ดูข้อมูลตัวเอง (ESS), ขอลา, เบิกค่าใช้จ่าย, ประเมินตัวเอง |

---

## 3. Feature Modules (26 โมดูล)

### Module 1: 🔐 Identity & Access Management (IAM)

**สถานะ: ✅ Backend Completed**

| Feature  | Description                              | API Endpoint              |
| -------- | ---------------------------------------- | ------------------------- |
| Login    | ล็อคอินด้วย username/password รับ JWT    | `POST /api/auth/login`    |
| Register | สมัครสมาชิกใหม่ (default role: EMPLOYEE) | `POST /api/auth/register` |
| Profile  | ดูข้อมูลผู้ใช้ปัจจุบัน (JWT protected)   | `GET /api/auth/profile`   |
| RBAC     | Role-based guard (ADMIN, HR, EMPLOYEE)   | `@Roles()` decorator      |

- **Security:** Bcrypt 12 rounds, JWT Bearer token, generic error messages (ป้องกัน user enumeration)
- **Token:** เก็บใน localStorage, หมดอายุ 1 วัน (configurable)

---

### Module 2: 👥 Employee Management (Core HR)

**สถานะ: ✅ Backend Completed**

| Feature    | Description                                   | API Endpoint                |
| ---------- | --------------------------------------------- | --------------------------- |
| Create     | สร้างพนักงานใหม่ (Admin/HR)                   | `POST /api/employees`       |
| List       | แสดงรายการพร้อม pagination, search, filter    | `GET /api/employees`        |
| Detail     | ดูข้อมูลพนักงานพร้อม nested relations ทั้งหมด | `GET /api/employees/:id`    |
| Update     | แก้ไขข้อมูลพนักงาน (Admin/HR)                 | `PATCH /api/employees/:id`  |
| Deactivate | Soft-delete (set isActive=false, Admin only)  | `DELETE /api/employees/:id` |

- **Search:** ค้นหาด้วย firstName, lastName, idCard (case-insensitive)
- **Filter:** departmentId, jobTitleId, isActive
- **Nested Relations:** department, jobTitle, user, leaveRequests, assets, expenseClaims, performanceReviews, exitChecklists, jobHistories

---

### Module 3: 🏢 Department Management

**สถานะ: ✅ Backend Completed**

| Feature | Description                  | API Endpoint                  |
| ------- | ---------------------------- | ----------------------------- |
| Create  | สร้างแผนกใหม่ (Admin/HR)     | `POST /api/departments`       |
| List    | แสดงทุกแผนกพร้อมจำนวนพนักงาน | `GET /api/departments`        |
| Detail  | ดูแผนกพร้อมรายชื่อพนักงาน    | `GET /api/departments/:id`    |
| Update  | แก้ไขชื่อแผนก (Admin/HR)     | `PATCH /api/departments/:id`  |
| Delete  | ลบแผนก (Admin only)          | `DELETE /api/departments/:id` |

- **Seed Data:** Engineering, Human Resources, Finance, Marketing, Operations

---

### Module 4: 💼 Job Title Management

**สถานะ: ✅ Backend Completed**

| Feature | Description                     | API Endpoint                 |
| ------- | ------------------------------- | ---------------------------- |
| Create  | สร้างตำแหน่งงานใหม่ (Admin/HR)  | `POST /api/job-titles`       |
| List    | แสดงทุกตำแหน่งพร้อมจำนวนพนักงาน | `GET /api/job-titles`        |
| Detail  | ดูตำแหน่งพร้อมรายชื่อพนักงาน    | `GET /api/job-titles/:id`    |
| Update  | แก้ไขชื่อตำแหน่ง (Admin/HR)     | `PATCH /api/job-titles/:id`  |
| Delete  | ลบตำแหน่ง (Admin only)          | `DELETE /api/job-titles/:id` |

- **Seed Data:** Software Engineer, HR Manager, Accountant, Marketing Specialist, Operations Manager, Senior Developer, Junior Developer

---

### Module 5: 🏖️ Smart Leave Management (ระบบจัดการวันลาและปฏิทินทีม)

**สถานะ: ✅ Backend CRUD Completed | ⏳ Advanced Features Pending**

| Feature            | Description                                            | API Endpoint                     | Status |
| ------------------ | ------------------------------------------------------ | -------------------------------- | ------ |
| Create             | พนักงานขอลา (date validation)                          | `POST /api/leave-requests`       | ✅     |
| List               | แสดงรายการพร้อม filter (employeeId, status, leaveType) | `GET /api/leave-requests`        | ✅     |
| Detail             | ดูรายละเอียดคำขอลา                                     | `GET /api/leave-requests/:id`    | ✅     |
| Approve/Reject     | HR/Admin อนุมัติ/ปฏิเสธ                                | `PATCH /api/leave-requests/:id`  | ✅     |
| Delete             | ลบคำขอลา (Admin only)                                  | `DELETE /api/leave-requests/:id` | ✅     |
| Team Calendar      | ปฏิทินแสดงวันลาของทีม (Nuxt UI Calendar)               | Frontend                         | ⏳     |
| Leave Balance      | ยอดวันลาคงเหลือ Real-time                              | Backend + Frontend               | ⏳     |
| Email Notification | แจ้งเตือนเมื่ออนุมัติ/ปฏิเสธ                           | Backend (Mailer)                 | ⏳     |

**Business Rules:**

- `endDate` ต้อง >= `startDate`
- คำขอที่ถูก APPROVED/REJECTED แล้วไม่สามารถเปลี่ยนสถานะได้
- Leave Types: ANNUAL, SICK, PERSONAL, MATERNITY, OTHER

---

### Module 6: 🚨 Contract & Document Expiry Alerts

**สถานะ: ⏳ NOT YET IMPLEMENTED**

| Feature              | Description                                         | Status |
| -------------------- | --------------------------------------------------- | ------ |
| Contract Expiry Scan | สแกนพนักงานที่ `contractEndDate` จะหมดอายุใน 30 วัน | ⏳     |
| Document Expiry      | ตรวจสอบบัตรประชาชน/ใบอนุญาตทำงานหมดอายุ             | ⏳     |
| Auto Notification    | พุช Notification หรือส่ง Email แจ้ง HR อัตโนมัติ    | ⏳     |
| Cron Job             | ใช้ `@nestjs/schedule` รันเช็คทุกเที่ยงคืน          | ⏳     |

**Tech Requirements:**

- เพิ่ม fields: `contractEndDate`, `idCardExpiry`, `workPermitExpiry` ใน Employee model
- ติดตั้ง `@nestjs/schedule` สำหรับ Cron Jobs
- ติดตั้ง `@nestjs-modules/mailer` สำหรับ Email notifications

---

### Module 7: 💻 Company Asset Tracking

**สถานะ: ✅ Backend Completed**

| Feature         | Description                                         | API Endpoint             |
| --------------- | --------------------------------------------------- | ------------------------ |
| Create          | เพิ่มทรัพย์สินใหม่ (Admin/HR)                       | `POST /api/assets`       |
| List            | แสดงรายการพร้อม search, filter (status, employeeId) | `GET /api/assets`        |
| Detail          | ดูรายละเอียดทรัพย์สินพร้อมข้อมูลผู้ถือครอง          | `GET /api/assets/:id`    |
| Assign/Unassign | มอบหมาย/เรียกคืนทรัพย์สิน (Admin/HR)                | `PATCH /api/assets/:id`  |
| Delete          | ลบทรัพย์สิน (Admin only)                            | `DELETE /api/assets/:id` |

- **Status:** AVAILABLE, ASSIGNED, RETIRED
- **Search:** ค้นหาด้วย assetName, serialNumber
- **Unique Constraint:** serialNumber ต้องไม่ซ้ำ

---

### Module 8: 📈 360-Degree Performance Appraisal

**สถานะ: ✅ Backend CRUD Completed | ⏳ Advanced Features Pending**

| Feature         | Description                                             | API Endpoint                          | Status |
| --------------- | ------------------------------------------------------- | ------------------------------------- | ------ |
| Create          | สร้างแบบประเมิน (Admin/HR)                              | `POST /api/performance-reviews`       | ✅     |
| List            | แสดงรายการพร้อม filter (revieweeId, reviewerId, period) | `GET /api/performance-reviews`        | ✅     |
| Detail          | ดูรายละเอียดการประเมิน                                  | `GET /api/performance-reviews/:id`    | ✅     |
| Update          | แก้ไขการประเมิน (Admin/HR)                              | `PATCH /api/performance-reviews/:id`  | ✅     |
| Delete          | ลบการประเมิน (Admin only)                               | `DELETE /api/performance-reviews/:id` | ✅     |
| Radar Chart     | กราฟใยแมงมุมแสดงจุดแข็ง-จุดอ่อน                         | Frontend (Chart.js/ApexCharts)        | ⏳     |
| Self Assessment | พนักงานประเมินตัวเอง                                    | Frontend + Backend                    | ⏳     |
| Peer Review     | ประเมินเพื่อนร่วมงาน                                    | Frontend + Backend                    | ⏳     |

---

### Module 9: 🏥 Expense & Welfare Claims

**สถานะ: ✅ Backend CRUD Completed (via Employee nested) | ⏳ Standalone Module Pending**

| Feature        | Description                                        | Status                  |
| -------------- | -------------------------------------------------- | ----------------------- |
| Create Claim   | พนักงานเบิกค่าใช้จ่าย (ค่ารักษาพยาบาล, ค่าเดินทาง) | ✅ Schema ready         |
| Receipt Upload | อัปโหลดรูปใบเสร็จ/PDF                              | ⏳ File upload endpoint |
| Approve/Reject | HR/บัญชี อนุมัติจ่ายเงินคืน                        | ⏳ Approval workflow    |
| Reimbursement  | เชื่อมต่อรอบเงินเดือน                              | ⏳                      |

**Tech Requirements:**

- สร้าง dedicated `ExpenseClaimsModule` (Controller + Service)
- ระบบ Upload ไฟล์ (Multer → local/cloud storage)
- เก็บ `receiptUrl` ในฐานข้อมูล

---

### Module 10: 🚪 Seamless Offboarding & Exit Checklist

**สถานะ: ✅ Backend Completed**

| Feature       | Description                                 | API Endpoint                                     |
| ------------- | ------------------------------------------- | ------------------------------------------------ |
| Create Item   | สร้างรายการ checklist (Admin/HR)            | `POST /api/exit-checklists`                      |
| Auto-Generate | สร้าง checklist อัตโนมัติ 10 รายการ         | `POST /api/exit-checklists/generate/:employeeId` |
| List          | แสดงรายการ checklist (filter by employeeId) | `GET /api/exit-checklists`                       |
| Mark Complete | ติ๊กถูกว่าจัดการเรียบร้อย                   | `PATCH /api/exit-checklists/:id`                 |
| Delete        | ลบรายการ (Admin only)                       | `DELETE /api/exit-checklists/:id`                |

**Default Checklist Items (10 รายการ):**

1. Return employee ID badge
2. Return laptop/computer equipment
3. Return company mobile phone
4. Return company vehicle keys
5. Revoke email and system access
6. Complete knowledge transfer documentation
7. Return parking pass / access cards
8. Settle pending expense claims
9. Exit interview completed
10. Final payroll processed

---

### Module 11: 📊 Advanced HR Analytics & Insights

**สถานะ: ⏳ NOT YET IMPLEMENTED**

| Feature              | Description                           | Status      |
| -------------------- | ------------------------------------- | ----------- |
| Turnover Rate        | อัตราการลาออกรายเดือน/รายปี           | ⏳          |
| Average Tenure       | อายุงานเฉลี่ยพนักงาน                  | ⏳          |
| Gender Ratio         | สัดส่วนชาย-หญิง                       | ⏳          |
| Payroll Expense      | งบประมาณเงินเดือนรวมแต่ละแผนก         | ⏳          |
| Department Headcount | จำนวนพนักงานแต่ละแผนก (มีแล้วบางส่วน) | ✅ Partial  |
| Dashboard Cards      | Metrics cards แสดงตัวเลขสำคัญ         | ⏳ Frontend |

**Tech Requirements:**

- สร้าง `DashboardModule` (aggregate queries)
- สร้าง `GET /api/dashboard/stats` endpoint
- Frontend: Chart.js / ApexCharts สำหรับ visualization

---

### Module 12: 🔄 Internal Mobility & Promotion History

**สถานะ: ✅ Backend Completed**

| Feature  | Description                               | API Endpoint                                  |
| -------- | ----------------------------------------- | --------------------------------------------- |
| Create   | บันทึกการเลื่อนตำแหน่ง/โยกย้าย (Admin/HR) | `POST /api/job-histories`                     |
| List     | แสดงรายการประวัติ (filter by employeeId)  | `GET /api/job-histories`                      |
| Timeline | ดู Career Timeline ของพนักงาน             | `GET /api/job-histories/timeline/:employeeId` |
| Detail   | ดูรายละเอียดการเปลี่ยนตำแหน่ง             | `GET /api/job-histories/:id`                  |
| Update   | แก้ไขประวัติ (Admin/HR)                   | `PATCH /api/job-histories/:id`                |
| Delete   | ลบประวัติ (Admin only)                    | `DELETE /api/job-histories/:id`               |

- **Validation:** ตรวจสอบว่า Employee, oldTitleId, newTitleId มีอยู่จริง
- **Timeline:** เรียงตาม effectiveDate จากใหม่ไปเก่า

---

### Module 13: 💬 Employee Pulse Surveys

**สถานะ: ⏳ NOT YET IMPLEMENTED**

| Feature           | Description                | Status |
| ----------------- | -------------------------- | ------ |
| Create Survey     | สร้างแบบสอบถามประจำเดือน   | ⏳     |
| Anonymous Voting  | พนักงานโหวตแบบไม่ระบุตัวตน | ⏳     |
| Results Dashboard | แสดงผลสำรวจเป็นกราฟ        | ⏳     |
| Trend Analysis    | เปรียบเทียบผลสำรวจรายเดือน | ⏳     |

**Tech Requirements:**

- เพิ่ม models: `Survey`, `SurveyQuestion`, `SurveyResponse`
- Anonymous: ไม่เก็บ employeeId ใน response
- Frontend: Bar chart / Line chart แสดง trend

---

### Module 14: 🔐 Enterprise Security: 2FA & Magic Link

**สถานะ: ⏳ NOT YET IMPLEMENTED**

| Feature            | Description                              | Status |
| ------------------ | ---------------------------------------- | ------ |
| 2FA (TOTP)         | OTP ผ่านแอป Authenticator (Google/Authy) | ⏳     |
| Magic Link         | ส่ง link ล็อคอินไปที่อีเมล               | ⏳     |
| Session Management | จัดการ active sessions                   | ⏳     |
| Password Policy    | บังคับความซับซ้อนรหัสผ่าน                | ⏳     |

**Tech Requirements:**

- ติดตั้ง `otplib` สำหรับ TOTP
- เพิ่ม fields: `twoFactorSecret`, `isTwoFactorEnabled` ใน User model
- Magic Link: สร้าง short-lived token ส่งผ่าน email

---

### Module 15: 💰 Payroll Management

**สถานะ: ⏳ NOT YET IMPLEMENTED (Schema มี baseSalary แล้ว)**

| Feature            | Description                         | Status |
| ------------------ | ----------------------------------- | ------ |
| Salary Calculation | คำนวณเงินเดือนสุทธิ (หัก SSO, ภาษี) | ⏳     |
| Payslip Generation | สร้างสลิปเงินเดือน PDF              | ⏳     |
| Payroll Run        | ประมวลผลเงินเดือนรายเดือน           | ⏳     |
| Tax Report         | รายงานภาษี ภ.ง.ด.1                  | ⏳     |

---

### Module 16: 📋 Employee Self-Service (ESS)

**สถานะ: ⏳ NOT YET IMPLEMENTED (Auth profile endpoint มีแล้ว)**

| Feature        | Description                            | Status                    |
| -------------- | -------------------------------------- | ------------------------- |
| View Profile   | พนักงานดูข้อมูลตัวเอง                  | ✅ Partial (auth/profile) |
| Update Profile | แก้ไขข้อมูลส่วนตัว (ที่อยู่, เบอร์โทร) | ⏳                        |
| View Payslip   | ดูสลิปเงินเดือน                        | ⏳                        |
| Request Leave  | ขอลา (ใช้ leave-requests module)       | ✅                        |
| Submit Expense | เบิกค่าใช้จ่าย                         | ✅ Schema ready           |

---

## 4. Non-Functional Requirements

| Requirement           | Specification                                                       |
| --------------------- | ------------------------------------------------------------------- |
| **Authentication**    | JWT Bearer token, Bcrypt 12 rounds                                  |
| **Authorization**     | Role-based (ADMIN, HR, EMPLOYEE) via guards                         |
| **API Documentation** | Swagger UI at `/api/docs`                                           |
| **Validation**        | class-validator whitelist + forbidNonWhitelisted                    |
| **Error Handling**    | Consistent HTTP status codes, generic auth errors                   |
| **Pagination**        | All list endpoints support `page` + `limit` query params            |
| **Search**            | Case-insensitive search via Prisma `contains` + `mode: insensitive` |
| **Soft Delete**       | Employees use `isActive` flag instead of hard delete                |
| **CORS**              | Configured for frontend origin                                      |
| **Logging**           | NestJS Logger per service                                           |
| **Database**          | PostgreSQL with Prisma ORM, auto-migrations                         |
| **i18n**              | EN/TH (frontend, planned)                                           |
| **Responsive**        | Mobile 375px / Tablet 768px / Desktop 1440px (frontend, planned)    |
| **Theme**             | Dark/Light/System via `@nuxtjs/color-mode` (frontend, planned)      |

---

### Module 17: 📋 Audit Log & Activity Tracking

**สถานะ: ✅ Backend Completed**

| Feature     | Description                                    | API Endpoint              |
| ----------- | ---------------------------------------------- | ------------------------- |
| Auto-Record | NestJS Interceptor บันทึก CREATE/UPDATE/DELETE | Automatic via interceptor |
| View Logs   | ดู audit trail พร้อม filter (Admin only)       | `GET /api/audit-logs`     |

- **Fields:** userId, username, action, entity, entityId, oldValue, newValue, ipAddress, userAgent
- **Compliance:** PDPA, ISO 27001 ready

---

### Module 18: ⏰ Overtime & Timesheet

**สถานะ: ✅ Backend Completed**

| Feature        | Description                     | API Endpoint                               |
| -------------- | ------------------------------- | ------------------------------------------ |
| OT Request     | ขอทำ OT พร้อม approval workflow | `POST /api/overtime/requests`              |
| Approve/Reject | อนุมัติ/ปฏิเสธ OT (Admin/HR)    | `PATCH /api/overtime/requests/:id/approve` |
| Clock In       | บันทึกเวลาเข้างาน               | `POST /api/overtime/clock-in`              |
| Clock Out      | บันทึกเวลาออกงาน + คำนวณชั่วโมง | `POST /api/overtime/clock-out`             |
| Timesheet      | ดูบันทึกเวลาทำงานรายเดือน       | `GET /api/overtime/timesheet`              |

---

### Module 19: 🎯 Recruitment & Applicant Tracking (ATS)

**สถานะ: ✅ Backend Completed**

| Feature        | Description                                          | API Endpoint                                      |
| -------------- | ---------------------------------------------------- | ------------------------------------------------- |
| Job Postings   | CRUD ตำแหน่งว่าง (OPEN/CLOSED/ON_HOLD)               | `POST/GET/PATCH/DELETE /api/recruitment/postings` |
| Applicants     | สร้างผู้สมัครงาน                                     | `POST /api/recruitment/postings/:id/applicants`   |
| Pipeline Stage | เปลี่ยนสถานะ APPLIED→SCREENING→INTERVIEW→OFFER→HIRED | `PATCH /api/recruitment/applicants/:id/stage`     |

---

### Module 20: 🏗️ Organization Chart

**สถานะ: ✅ Backend Completed**

| Feature      | Description                 | API Endpoint                          |
| ------------ | --------------------------- | ------------------------------------- |
| Org Tree     | แสดงโครงสร้างองค์กรแบบ tree | `GET /api/org-chart/tree`             |
| Subordinates | ดูลูกน้องของพนักงาน         | `GET /api/org-chart/:id/subordinates` |
| Set Manager  | กำหนดหัวหน้า (Admin/HR)     | `PATCH /api/org-chart/:id/manager`    |

- **Implementation:** Self-referencing `managerId` ใน Employee model

---

### Module 21: 📚 Training & Development

**สถานะ: ✅ Backend Completed**

| Feature    | Description                            | API Endpoint                                  |
| ---------- | -------------------------------------- | --------------------------------------------- |
| Courses    | CRUD หลักสูตรอบรม                      | `POST/GET/PATCH/DELETE /api/training/courses` |
| Enrollment | ลงทะเบียนพนักงานเข้าอบรม               | `POST /api/training/courses/:id/enroll`       |
| Completion | อัปเดตสถานะ ENROLLED→COMPLETED + คะแนน | `PATCH /api/training/enrollments/:id`         |

- **Features:** maxCapacity check, duplicate enrollment prevention

---

### Module 22: 📄 Document Management (DMS)

**สถานะ: ✅ Backend Completed**

| Feature       | Description                                | API Endpoint                      |
| ------------- | ------------------------------------------ | --------------------------------- |
| Upload        | สร้างเอกสาร HR (CONTRACT/CERTIFICATE/etc.) | `POST /api/documents`             |
| List/Filter   | ค้นหาเอกสารตาม category, employeeId        | `GET /api/documents`              |
| Detail        | ดูรายละเอียดเอกสาร                         | `GET /api/documents/:id`          |
| Update/Delete | แก้ไข/ลบเอกสาร                             | `PATCH/DELETE /api/documents/:id` |

---

### Module 23: 🏥 Benefits & Welfare Management

**สถานะ: ✅ Backend Completed**

| Feature       | Description                                    | API Endpoint                                   |
| ------------- | ---------------------------------------------- | ---------------------------------------------- |
| Benefit Plans | CRUD แผนสวัสดิการ (HEALTH/PROVIDENT_FUND/etc.) | `POST/GET/PATCH/DELETE /api/benefits/plans`    |
| Enroll        | ลงทะเบียนพนักงานเข้าแผนสวัสดิการ               | `POST /api/benefits/plans/:id/enroll`          |
| Unenroll      | ยกเลิกสวัสดิการ                                | `PATCH /api/benefits/enrollments/:id/unenroll` |

---

### Module 24: 🗓️ Shift & Roster Scheduling

**สถานะ: ✅ Backend Completed**

| Feature  | Description                         | API Endpoint                 |
| -------- | ----------------------------------- | ---------------------------- |
| Shifts   | สร้างกะทำงาน (Morning, Night, etc.) | `POST/GET/PATCH /api/shifts` |
| Assign   | จัดตารางกะให้พนักงาน                | `POST /api/shifts/assign`    |
| Schedule | ดูตารางกะตาม employee/date range    | `GET /api/shifts/schedule`   |

- **Conflict Detection:** ป้องกันจัดกะซ้ำวันเดียวกัน (unique constraint)

---

### Module 25: 🎯 KPI & Goal Management (OKR)

**สถานะ: ✅ Backend Completed**

| Feature     | Description                         | API Endpoint                       |
| ----------- | ----------------------------------- | ---------------------------------- |
| Goals       | สร้างเป้าหมายรายบุคคล + Key Results | `POST/GET/PATCH/DELETE /api/goals` |
| Key Results | อัปเดตค่า currentValue ของ KR       | `PATCH /api/goals/key-results/:id` |
| Progress    | ติดตามความคืบหน้า 0–100%            | Included in goal update            |

---

### Module 26: 📢 Announcements & Internal Communication

**สถานะ: ✅ Backend Completed**

| Feature | Description                               | API Endpoint                            |
| ------- | ----------------------------------------- | --------------------------------------- |
| Create  | สร้างประกาศ (LOW/NORMAL/HIGH/URGENT)      | `POST /api/announcements`               |
| List    | แสดงประกาศ (pinned first, filter by role) | `GET /api/announcements`                |
| Archive | เก็บประกาศเข้าคลัง                        | `PATCH /api/announcements/:id/archive`  |
| Target  | กำหนดกลุ่มเป้าหมาย (role/department/all)  | Via `targetRole`, `targetDeptId` fields |

---

## 5. Summary — Backend Completion Status (26/26 Complete)

### Core Modules (9)

| Module              | Backend Status | Notes                                    |
| ------------------- | -------------- | ---------------------------------------- |
| IAM (Auth)          | ✅ Complete    | Login, Register, Profile, RBAC           |
| Employees           | ✅ Complete    | Full CRUD + search + pagination + nested |
| Departments         | ✅ Complete    | CRUD + employee count                    |
| Job Titles          | ✅ Complete    | CRUD + employee count                    |
| Leave Requests      | ✅ Complete    | CRUD + approval workflow                 |
| Assets              | ✅ Complete    | CRUD + assignment tracking               |
| Performance Reviews | ✅ Complete    | CRUD + 360° appraisal                    |
| Exit Checklists     | ✅ Complete    | Auto-generate 10 items                   |
| Job Histories       | ✅ Complete    | Timeline endpoint included               |

### Batch 2 Modules (7)

| Module         | Backend Status | Notes                                                |
| -------------- | -------------- | ---------------------------------------------------- |
| Expense Claims | ✅ Complete    | CRUD + approval workflow (PENDING→APPROVED/REJECTED) |
| Dashboard      | ✅ Complete    | HR analytics: headcount, turnover, dept stats        |
| Notifications  | ✅ Complete    | Per-user alerts + midnight cron contract expiry      |
| Pulse Surveys  | ✅ Complete    | Anonymous surveys + aggregated results               |
| Payroll        | ✅ Complete    | Monthly runs (DRAFT→PROCESSING→COMPLETED), SSO/tax   |
| ESS Portal     | ✅ Complete    | Employee self-service: profile, leaves, payslips     |
| 2FA Security   | ✅ Complete    | TOTP setup/verify/disable with QR code               |

### Batch 3 Modules (10)

| Module        | Backend Status | Notes                                            |
| ------------- | -------------- | ------------------------------------------------ |
| Audit Log     | ✅ Complete    | Interceptor auto-records WHO/WHAT/WHEN           |
| Overtime      | ✅ Complete    | OT requests + approval + clock-in/out timesheet  |
| Recruitment   | ✅ Complete    | Job postings + applicant tracking (ATS pipeline) |
| Org Chart     | ✅ Complete    | Tree view + manager/subordinate reporting lines  |
| Training      | ✅ Complete    | Courses + enrollment + capacity + completion     |
| Documents     | ✅ Complete    | HR document management + category + expiry       |
| Benefits      | ✅ Complete    | Benefit plans + employee enrollment/unenrollment |
| Shifts        | ✅ Complete    | Shift definitions + roster scheduling + calendar |
| Goals (OKR)   | ✅ Complete    | Goals + key results + progress tracking          |
| Announcements | ✅ Complete    | Company announcements + pin/archive + targeting  |
