// ─────────────────────────────────────────────────────────────────────────────
// DashboardService — HR Analytics & aggregate statistics
// ─────────────────────────────────────────────────────────────────────────────
// Provides computed metrics for the executive dashboard:
//   • Total headcount (active/inactive)
//   • Department breakdown
//   • Turnover rate
//   • Leave statistics
//   • Payroll expense summary
//   • Recent activity feed
// ─────────────────────────────────────────────────────────────────────────────

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Main dashboard stats — single aggregated response */
  async getStats() {
    const [
      totalEmployees,
      activeEmployees,
      inactiveEmployees,
      departmentCount,
      pendingLeaves,
      pendingClaims,
      totalAssets,
      assignedAssets,
    ] = await Promise.all([
      this.prisma.employee.count(),
      this.prisma.employee.count({ where: { isActive: true } }),
      this.prisma.employee.count({ where: { isActive: false } }),
      this.prisma.department.count(),
      this.prisma.leaveRequest.count({ where: { status: 'PENDING' } }),
      this.prisma.expenseClaim.count({ where: { status: 'PENDING' } }),
      this.prisma.asset.count(),
      this.prisma.asset.count({ where: { status: 'ASSIGNED' } }),
    ]);

    const turnoverRate =
      totalEmployees > 0
        ? Number(((inactiveEmployees / totalEmployees) * 100).toFixed(1))
        : 0;

    return {
      headcount: {
        total: totalEmployees,
        active: activeEmployees,
        inactive: inactiveEmployees,
        turnoverRate,
      },
      departments: departmentCount,
      pendingApprovals: {
        leaveRequests: pendingLeaves,
        expenseClaims: pendingClaims,
      },
      assets: {
        total: totalAssets,
        assigned: assignedAssets,
        available: totalAssets - assignedAssets,
      },
    };
  }

  /** Department headcount breakdown */
  async getDepartmentStats() {
    const departments = await this.prisma.department.findMany({
      include: {
        _count: { select: { employees: true } },
      },
      orderBy: { departmentName: 'asc' },
    });

    return departments.map((d) => ({
      id: d.id,
      name: d.departmentName,
      headcount: d._count.employees,
    }));
  }

  /** Payroll expense by department (sum of baseSalary for active employees) */
  async getPayrollByDepartment() {
    const result = await this.prisma.employee.groupBy({
      by: ['departmentId'],
      where: { isActive: true },
      _sum: { baseSalary: true },
      _count: true,
    });

    const departments = await this.prisma.department.findMany();
    const deptMap = new Map(departments.map((d) => [d.id, d.departmentName]));

    return result.map((r) => ({
      departmentId: r.departmentId,
      departmentName: deptMap.get(r.departmentId) ?? 'Unknown',
      totalSalary: r._sum.baseSalary,
      employeeCount: r._count,
    }));
  }

  /** Monthly leave statistics for the current year */
  async getLeaveStats() {
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

    const leaves = await this.prisma.leaveRequest.groupBy({
      by: ['status'],
      where: {
        startDate: { gte: startOfYear, lte: endOfYear },
      },
      _count: true,
    });

    return leaves.map((l) => ({
      status: l.status,
      count: l._count,
    }));
  }
}
