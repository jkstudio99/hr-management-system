# HR Management System

Modern, full-stack HRMS with an Apple HIG-inspired UI.

## Overview

This repository contains:

- **Backend**: NestJS + Prisma + PostgreSQL (REST API)
- **Frontend**: Nuxt 3 + Nuxt UI + Tailwind + Pinia + i18n (Thai/English)

## Key Features

- **Auth & RBAC**: JWT login + role-based access (ADMIN / HR / EMPLOYEE)
- **Employee Master Data**: employees, departments, job titles, job histories
- **HR Workflows**: leave requests approval, expense claims approval, overtime requests approval
- **Operations**: assets management, shifts & roster scheduling
- **Engagement**: announcements, surveys (pulse)
- **Analytics**: dashboard stats (dept breakdown, leaves, payroll summaries)
- **Security**: TOTP 2FA endpoints (API)
- **Audit**: audit logs for create/update/delete actions

## Tech Stack

### Backend

- NestJS 11
- Prisma
- PostgreSQL
- Swagger: `/api/docs`

### Frontend

- Nuxt 3
- Nuxt UI
- TailwindCSS
- Pinia
- vue-i18n
- Playwright E2E tests

## Quick Start

### 1) Backend

```bash
cd backend
npm install

# configure your database (example)
# cp .env.example .env

# prisma generate/migrate/seed (if needed)
# npx prisma migrate dev
# npx prisma db seed

npm run start:dev
```

Backend will be available at:

- API: `http://localhost:3000/api`
- Swagger: `http://localhost:3000/api/docs`

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at:

- Web: `http://localhost:3001/`

## Default Credentials

- **Username**: `admin`
- **Password**: `password`

## Testing

### Frontend (E2E)

```bash
cd frontend
npx playwright test
```

### Backend

```bash
cd backend
npm test
npm run test:e2e
```

## Repository Structure

```text
.
├─ backend/         # NestJS API
├─ frontend/        # Nuxt 3 UI
└─ docs/            # Product/DB/Design docs
```

## Notes

- Generated/build output is intentionally ignored via `.gitignore` (e.g. `node_modules/`, `frontend/.nuxt/`, `frontend/test-results/`).
