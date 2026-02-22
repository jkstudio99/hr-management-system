# 01 — Project Plan & Architecture

> Enterprise HR Management System — Monorepo Architecture
> Last updated: 2026-02-22

---

## 1. Project Overview

ระบบบริหารจัดการทรัพยากรบุคคลระดับองค์กร (Enterprise HR Management System) สเกล Super App ออกแบบมาเพื่อรองรับการทำงานของฝ่าย HR, ผู้บริหาร และพนักงานทุกระดับ ครอบคลุมตั้งแต่การจัดการข้อมูลพนักงาน, ระบบวันลา, ทรัพย์สิน, การประเมินผลงาน, การเบิกค่าใช้จ่าย ไปจนถึงระบบ Offboarding

## 2. Monorepo Structure

```
hr-management-system/
├── backend/                 # NestJS REST API + Prisma ORM + PostgreSQL
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema (11 models)
│   │   ├── seed.ts          # Seed script (roles, admin, departments, job titles)
│   │   └── migrations/      # Prisma migration history
│   ├── src/
│   │   ├── main.ts          # App entry point (Swagger, CORS, Validation)
│   │   ├── app.module.ts    # Root module — registers all feature modules
│   │   ├── prisma/          # PrismaService (global DB access)
│   │   ├── auth/            # Authentication & Authorization (JWT, RBAC)
│   │   ├── employees/       # Employee CRUD + search + pagination
│   │   ├── departments/     # Department CRUD
│   │   ├── job-titles/      # Job Title CRUD
│   │   ├── leave-requests/  # Leave management + approval workflow
│   │   ├── assets/          # Company asset tracking
│   │   ├── performance-reviews/  # 360° performance appraisal
│   │   ├── exit-checklists/     # Offboarding checklist
│   │   └── job-histories/       # Promotion & transfer history
│   ├── .env.example
│   └── package.json
├── frontend/                # Nuxt 3 + Nuxt UI + Tailwind CSS + Pinia (Step 4+)
└── docs/                    # Project documentation
```

## 3. Tech Stack

### Backend

| Technology            | Version | Purpose                           |
| --------------------- | ------- | --------------------------------- |
| **NestJS**            | ^11.0.1 | REST API framework                |
| **Prisma ORM**        | ^6.19.2 | Database ORM & migrations         |
| **PostgreSQL**        | 15+     | Primary database                  |
| **@nestjs/jwt**       | ^11.0.2 | JWT token signing/verification    |
| **@nestjs/passport**  | ^11.0.5 | Passport strategy integration     |
| **@nestjs/swagger**   | ^11.2.6 | OpenAPI / Swagger UI              |
| **bcrypt**            | ^6.0.0  | Password hashing (12 salt rounds) |
| **class-validator**   | ^0.14.3 | DTO validation                    |
| **class-transformer** | ^0.5.1  | DTO transformation                |

### Frontend (Planned — Step 4+)

| Technology               | Purpose                                |
| ------------------------ | -------------------------------------- |
| **Nuxt 3**               | SSR/SSG Vue framework                  |
| **Nuxt UI**              | Component library (dashboard template) |
| **Tailwind CSS**         | Utility-first CSS                      |
| **Pinia**                | State management                       |
| **vue-i18n**             | Internationalization (EN/TH)           |
| **@nuxtjs/google-fonts** | Noto Sans Thai font                    |
| **@nuxtjs/color-mode**   | Dark/Light/System theme                |

## 4. Execution Plan (Step-by-Step)

### STEP 1: Backend Initialization & Database ✅ COMPLETED

- [x] สร้างโฟลเดอร์ `/backend` และ Initialize NestJS
- [x] ติดตั้ง Prisma, เซ็ตอัป `schema.prisma` (11 models)
- [x] สร้าง `seed.ts` — Roles (ADMIN, HR, EMPLOYEE), Root admin user, Departments, Job Titles
- [x] รัน Prisma migrations (`npx prisma migrate dev --name init`)

### STEP 2: Backend Security & Auth Module ✅ COMPLETED

- [x] `AuthModule` — `@nestjs/passport` + `@nestjs/jwt`
- [x] Bcrypt password hashing (12 salt rounds)
- [x] `POST /api/auth/login` — Authenticate & receive JWT
- [x] `POST /api/auth/register` — Create account & receive JWT
- [x] `GET /api/auth/profile` — Get current user (JWT protected)
- [x] `JwtAuthGuard` — Passport JWT strategy
- [x] `RolesGuard` + `@Roles()` decorator — RBAC (ADMIN, HR, EMPLOYEE)

### STEP 3: Backend Core API Modules ✅ COMPLETED

- [x] Employees CRUD (paginated, searchable, nested relations)
- [x] Departments CRUD (with employee count)
- [x] Job Titles CRUD (with employee count)
- [x] Leave Requests CRUD (approval workflow, date validation)
- [x] Assets CRUD (assignment tracking)
- [x] Performance Reviews CRUD (360° appraisal)
- [x] Exit Checklists CRUD (auto-generate checklist)
- [x] Job Histories CRUD (career timeline)

### STEP 4: Frontend Initialization & Design System ⏳ PENDING

- [ ] สร้าง `/frontend` — Clone Nuxt UI Dashboard template
- [ ] ตั้งค่า `tailwind.config.ts` + `app.config.ts` (Apple-like + PrimeNG Orange)
- [ ] ติดตั้ง `@nuxtjs/google-fonts` (Noto Sans Thai)
- [ ] ตั้งค่า `@nuxtjs/color-mode` + `@nuxtjs/i18n` (EN/TH)
- [ ] อัปเดต Layout Header (Language Switcher + Theme Switcher)

### STEP 5: Frontend State & API Integration ⏳ PENDING

- [ ] สร้าง `useApi` composable (auto-inject JWT Bearer token)
- [ ] ตั้งค่า Pinia + `useAuthStore` (login state, user details, logout)

### STEP 6: Frontend Pages Implementation ⏳ PENDING

- [ ] หน้า `/login` — `<UForm>`, `<UInput>`, validation
- [ ] หน้า `/employees` — `<UTable>` + pagination + search + responsive `<UCard>`
- [ ] หน้า `/employees/[id]` — `<UTabs>` (Info, Leave History, Assets)
- [ ] หน้า `/leave` — Leave approval list/calendar

## 5. Quick Start

```bash
# Backend
cd backend
cp .env.example .env          # แก้ไข DATABASE_URL, JWT_SECRET
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run start:dev
# → http://localhost:3000/api
# → http://localhost:3000/api/docs  (Swagger UI)

# Frontend (Step 4+)
cd frontend
npm install
npm run dev
# → http://localhost:3001
```

## 6. Default Credentials

| Username | Password   | Role  |
| -------- | ---------- | ----- |
| `admin`  | `password` | ADMIN |

## 7. Environment Variables

| Variable         | Description                  | Example                                                          |
| ---------------- | ---------------------------- | ---------------------------------------------------------------- |
| `DATABASE_URL`   | PostgreSQL connection string | `postgresql://postgres:123456@localhost:5432/hrdb?schema=public` |
| `JWT_SECRET`     | Secret key for JWT signing   | `your-strong-random-secret`                                      |
| `JWT_EXPIRATION` | Token expiration time        | `1d`                                                             |
| `FRONTEND_URL`   | CORS allowed origin          | `http://localhost:3001`                                          |
| `PORT`           | Backend server port          | `3000`                                                           |
