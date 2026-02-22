// ─────────────────────────────────────────────────────────────────────────────
// DashboardController — HR Analytics & Insights endpoints
// ─────────────────────────────────────────────────────────────────────────────

import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth';

@ApiTags('dashboard')
@ApiBearerAuth('JWT-Auth')
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  /** GET /api/dashboard/stats — Main KPI metrics */
  @Get('stats')
  @Roles('ADMIN', 'HR')
  getStats() {
    return this.service.getStats();
  }

  /** GET /api/dashboard/departments — Department headcount breakdown */
  @Get('departments')
  @Roles('ADMIN', 'HR')
  getDepartmentStats() {
    return this.service.getDepartmentStats();
  }

  /** GET /api/dashboard/payroll — Payroll expense by department */
  @Get('payroll')
  @Roles('ADMIN', 'HR')
  getPayrollByDepartment() {
    return this.service.getPayrollByDepartment();
  }

  /** GET /api/dashboard/leaves — Leave statistics for current year */
  @Get('leaves')
  @Roles('ADMIN', 'HR')
  getLeaveStats() {
    return this.service.getLeaveStats();
  }
}
