// ─────────────────────────────────────────────────────────────────────────────
// AppModule — Root application module
// ─────────────────────────────────────────────────────────────────────────────
// Registers all top-level modules. PrismaModule is imported here and marked
// @Global, so PrismaService is available everywhere.
// Feature modules (Auth, Employees, etc.) will be added in subsequent steps.
// ─────────────────────────────────────────────────────────────────────────────

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma';
import { AuthModule } from './auth';
import { DepartmentsModule } from './departments';
import { JobTitlesModule } from './job-titles';
import { EmployeesModule } from './employees';
import { LeaveRequestsModule } from './leave-requests';
import { AssetsModule } from './assets';
import { PerformanceReviewsModule } from './performance-reviews';
import { ExitChecklistsModule } from './exit-checklists';
import { JobHistoriesModule } from './job-histories';
import { ExpenseClaimsModule } from './expense-claims';
import { DashboardModule } from './dashboard';
import { NotificationsModule } from './notifications';
import { SurveysModule } from './surveys';
import { PayrollModule } from './payroll';
import { EssModule } from './ess';
import { TwoFactorModule } from './two-factor';
import { AuditLogModule } from './audit-log';
import { OvertimeModule } from './overtime';
import { RecruitmentModule } from './recruitment';
import { OrgChartModule } from './org-chart';
import { TrainingModule } from './training';
import { DocumentsModule } from './documents';
import { BenefitsModule } from './benefits';
import { ShiftsModule } from './shifts';
import { GoalsModule } from './goals';
import { AnnouncementsModule } from './announcements';

@Module({
  imports: [
    // ── Configuration ───────────────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // ── Scheduler (for cron jobs) ────────────────────────────────────────
    ScheduleModule.forRoot(),

    // ── Database ────────────────────────────────────────────────────────
    PrismaModule,

    // ── Authentication & Authorization ──────────────────────────────────
    AuthModule,

    // ── Core Feature Modules ────────────────────────────────────────────
    DepartmentsModule,
    JobTitlesModule,
    EmployeesModule,
    LeaveRequestsModule,
    AssetsModule,
    PerformanceReviewsModule,
    ExitChecklistsModule,
    JobHistoriesModule,

    // ── Batch 2 Modules (7) ─────────────────────────────────────────────
    ExpenseClaimsModule,
    DashboardModule,
    NotificationsModule,
    SurveysModule,
    PayrollModule,
    EssModule,
    TwoFactorModule,

    // ── Batch 3 Modules (10) ────────────────────────────────────────────
    AuditLogModule,
    OvertimeModule,
    RecruitmentModule,
    OrgChartModule,
    TrainingModule,
    DocumentsModule,
    BenefitsModule,
    ShiftsModule,
    GoalsModule,
    AnnouncementsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
