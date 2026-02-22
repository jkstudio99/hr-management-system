# Enterprise HR Management System — Documentation

> Last updated: 2026-02-22

## 📚 Table of Contents

| Document                                                   | Description                                                        |
| ---------------------------------------------------------- | ------------------------------------------------------------------ |
| [README.md](README.md)                                     | This file — documentation index                                    |
| [01-PROJECT-PLAN.md](01-PROJECT-PLAN.md)                   | Monorepo structure, tech stack, execution plan, quick start        |
| [02-REQUIREMENTS.md](02-REQUIREMENTS.md)                   | 26 feature modules, RBAC, functional & non-functional requirements |
| [03-DATABASE-ARCHITECTURE.md](03-DATABASE-ARCHITECTURE.md) | Prisma schema (32 models), ER diagram, model specs                 |
| [04-DESIGN-SYSTEM.md](04-DESIGN-SYSTEM.md)                 | Apple-style UI/UX, typography, colors, i18n, dark mode             |
| [05-RESPONSIVE-DESIGN.md](05-RESPONSIVE-DESIGN.md)         | Mobile/Tablet/Desktop breakpoints, component patterns              |

---

## 🚀 Quick Start

```bash
# Backend
cd backend
cp .env.example .env          # Edit DATABASE_URL, JWT_SECRET
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

## 🔐 Default Credentials

| Username | Password   | Role  |
| -------- | ---------- | ----- |
| `admin`  | `password` | ADMIN |

---

## 📊 Backend Completion Status (26 Modules — All Complete)

### Core Modules (9)

| Module              | Status      | Notes                                         |
| ------------------- | ----------- | --------------------------------------------- |
| Auth (IAM)          | ✅ Complete | Login, Register, Profile, JWT, RBAC           |
| Employees           | ✅ Complete | CRUD + search + pagination + nested relations |
| Departments         | ✅ Complete | CRUD + employee count                         |
| Job Titles          | ✅ Complete | CRUD + employee count                         |
| Leave Requests      | ✅ Complete | CRUD + approval workflow                      |
| Assets              | ✅ Complete | CRUD + assignment tracking                    |
| Performance Reviews | ✅ Complete | CRUD + 360° appraisal                         |
| Exit Checklists     | ✅ Complete | CRUD + auto-generate 10 items                 |
| Job Histories       | ✅ Complete | CRUD + career timeline                        |

### Batch 2 Modules (7)

| Module         | Status      | Notes                                                |
| -------------- | ----------- | ---------------------------------------------------- |
| Expense Claims | ✅ Complete | CRUD + approval workflow (PENDING→APPROVED/REJECTED) |
| Dashboard      | ✅ Complete | HR analytics: headcount, turnover, dept stats        |
| Notifications  | ✅ Complete | Per-user alerts + midnight cron contract expiry      |
| Pulse Surveys  | ✅ Complete | Anonymous surveys + aggregated results               |
| Payroll        | ✅ Complete | Monthly runs (DRAFT→PROCESSING→COMPLETED), SSO/tax   |
| ESS Portal     | ✅ Complete | Employee self-service: profile, leaves, payslips     |
| 2FA Security   | ✅ Complete | TOTP setup/verify/disable with QR code               |

### Batch 3 Modules (10)

| Module        | Status      | Notes                                            |
| ------------- | ----------- | ------------------------------------------------ |
| Audit Log     | ✅ Complete | Interceptor auto-records WHO/WHAT/WHEN           |
| Overtime      | ✅ Complete | OT requests + approval + clock-in/out timesheet  |
| Recruitment   | ✅ Complete | Job postings + applicant tracking (ATS pipeline) |
| Org Chart     | ✅ Complete | Tree view + manager/subordinate reporting lines  |
| Training      | ✅ Complete | Courses + enrollment + capacity + completion     |
| Documents     | ✅ Complete | HR document management + category + expiry       |
| Benefits      | ✅ Complete | Benefit plans + employee enrollment/unenrollment |
| Shifts        | ✅ Complete | Shift definitions + roster scheduling + calendar |
| Goals (OKR)   | ✅ Complete | Goals + key results + progress tracking          |
| Announcements | ✅ Complete | Company announcements + pin/archive + targeting  |

### Test Results

| Metric       | Value                               |
| ------------ | ----------------------------------- |
| Test Suites  | 17 passed (Batch 2: 7, Batch 3: 10) |
| Total Tests  | 116 passed (65 + 51)                |
| Build        | TypeScript clean ✅                 |
| Curl/Swagger | All endpoints verified ✅           |

---

## 🖥️ Frontend Completion Status (Nuxt 3)

> Last updated: 2026-02-22

### Stack

- **Framework:** Nuxt 3.21 + Vue 3.5
- **UI:** Nuxt UI (PrimeNG Orange `#F97316` primary)
- **State:** Pinia
- **i18n:** @nuxtjs/i18n v10 — Thai (default) + English
- **Dark Mode:** `@nuxtjs/color-mode` — Light / Dark / System
- **CSS:** Tailwind CSS + custom design system (`assets/css/main.css`)
- **Testing:** Playwright E2E (10 test files)
- **Dev server:** `http://localhost:3001`

### Frontend Pages (27 pages across 26 modules)

| Module              | Page                   | Status      | Notes                                         |
| ------------------- | ---------------------- | ----------- | --------------------------------------------- |
| Auth                | `/auth/login`          | ✅ Complete | i18n, dark mode, lang/theme switcher          |
| Auth                | `/auth/register`       | ✅ Complete | i18n, dark mode                               |
| Dashboard           | `/`                    | ✅ Complete | Metric cards, dept chart, leave stats, OKR    |
| Employees           | `/employees`           | ✅ Complete | Table + CRUD modal, mobile cards, pagination  |
| Departments         | `/departments`         | ✅ Complete | Table + CRUD, useApiService                   |
| Job Titles          | `/job-titles`          | ✅ Complete | Table + CRUD                                  |
| Leave Requests      | `/leave-requests`      | ✅ Complete | Table + approval workflow                     |
| Assets              | `/assets`              | ✅ Complete | Table + CRUD, useApiService                   |
| Expense Claims      | `/expense-claims`      | ✅ Complete | Table + approval workflow                     |
| Payroll             | `/payroll`             | ✅ Complete | Payroll runs DRAFT→PROCESSING→COMPLETED       |
| Notifications       | `/notifications`       | ✅ Complete | Bell badge, mark read/all, i18n               |
| Overtime            | `/overtime`            | ✅ Complete | OT requests + clock-in/out                    |
| Recruitment         | `/recruitment`         | ✅ Complete | Job postings list                             |
| Recruitment         | `/recruitment/[id]`    | ✅ Complete | Applicant tracking ATS pipeline               |
| Training            | `/training`            | ✅ Complete | Courses + enrollment                          |
| Goals (OKR)         | `/goals`               | ✅ Complete | Goals + key results + progress                |
| Announcements       | `/announcements`       | ✅ Complete | Pin/archive + priority badges                 |
| Documents           | `/documents`           | ✅ Complete | Document management + expiry                  |
| Benefits            | `/benefits`            | ✅ Complete | Benefit plans + enrollment                    |
| Shifts              | `/shifts`              | ✅ Complete | Shift definitions + roster                    |
| Audit Log           | `/audit-log`           | ✅ Complete | WHO/WHAT/WHEN table                           |
| Surveys             | `/surveys`             | ✅ Complete | Pulse surveys + results                       |
| Performance Reviews | `/performance-reviews` | ✅ Complete | 360° appraisal                                |
| Exit Checklists     | `/exit-checklists`     | ✅ Complete | Checklist items + completion                  |
| Job Histories       | `/job-histories`       | ✅ Complete | Career timeline                               |
| Org Chart           | `/org-chart`           | ✅ Complete | Tree view                                     |
| Settings            | `/settings`            | ✅ Complete | Profile, Dark/Light/System, Language switcher |

### UI Features

- ✅ **Dark / Light / System mode** — Topbar dropdown + Settings page selector
- ✅ **Language switcher** — Thai 🇹🇭 / English 🇬🇧 dropdown in Topbar + Settings + Login
- ✅ **Responsive layout** — Mobile (375px) / Tablet (768px) / Desktop (1440px)
- ✅ **i18n translations** — All 26 modules, status badges, nav labels
- ✅ **StatusBadge** — Typed `BadgeColor`, i18n labels, 20+ status variants
- ✅ **Design system** — Apple HIG typography, CSS variables, dark mode tokens
- ✅ **Playwright E2E** — 10 test files covering all major modules

### Build Status

| Metric     | Value                |
| ---------- | -------------------- |
| Nuxt Build | ✅ Clean (0 errors)  |
| TypeScript | ✅ Clean             |
| i18n       | ✅ th + en loaded    |
| Dark Mode  | ✅ System/Light/Dark |
| Playwright | 10 spec files ready  |
