// ─────────────────────────────────────────────────────────────────────────────
// EssService — Employee Self-Service Portal
// ─────────────────────────────────────────────────────────────────────────────
// Allows employees (linked via User.employeeId) to:
//   • View their own profile & employment details
//   • Submit leave requests
//   • View their leave history
//   • View their assigned assets
//   • Submit expense claims
//   • View their expense claim history
//   • View their performance reviews
//   • View their payslips
// ─────────────────────────────────────────────────────────────────────────────

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma';

@Injectable()
export class EssService {
  private readonly logger = new Logger(EssService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Resolve employeeId from JWT userId */
  private async resolveEmployeeId(userId: number): Promise<number> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { employeeId: true },
    });
    if (!user?.employeeId) {
      throw new ForbiddenException(
        'Your account is not linked to an employee record. Contact HR.',
      );
    }
    return user.employeeId;
  }

  /** GET /ess/profile — Own employee profile */
  async getMyProfile(userId: number) {
    const employeeId = await this.resolveEmployeeId(userId);

    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        department: true,
        jobTitle: true,
        user: { select: { id: true, username: true, email: true } },
      },
    });
    if (!employee) throw new NotFoundException('Employee record not found');

    // Sanitize: hide baseSalary from ESS (only HR/Admin should see)
    const { baseSalary: _salary, ...safe } = employee;
    return safe;
  }

  /** GET /ess/leaves — Own leave requests */
  async getMyLeaves(userId: number, page = 1, limit = 20) {
    const employeeId = await this.resolveEmployeeId(userId);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.leaveRequest.findMany({
        where: { employeeId },
        skip,
        take: limit,
        orderBy: { id: 'desc' },
      }),
      this.prisma.leaveRequest.count({ where: { employeeId } }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /** POST /ess/leaves — Submit a leave request */
  async submitLeave(
    userId: number,
    dto: { leaveType: string; startDate: string; endDate: string },
  ) {
    const employeeId = await this.resolveEmployeeId(userId);

    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);
    if (endDate < startDate) {
      throw new BadRequestException('End date must be on or after start date');
    }

    const leave = await this.prisma.leaveRequest.create({
      data: {
        employeeId,
        leaveType: dto.leaveType,
        startDate,
        endDate,
      },
    });

    this.logger.log(
      `ESS: Employee #${employeeId} submitted leave request #${leave.id}`,
    );
    return leave;
  }

  /** GET /ess/assets — Own assigned assets */
  async getMyAssets(userId: number) {
    const employeeId = await this.resolveEmployeeId(userId);

    return this.prisma.asset.findMany({
      where: { employeeId },
      orderBy: { id: 'desc' },
    });
  }

  /** GET /ess/expense-claims — Own expense claims */
  async getMyExpenseClaims(userId: number, page = 1, limit = 20) {
    const employeeId = await this.resolveEmployeeId(userId);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.expenseClaim.findMany({
        where: { employeeId },
        skip,
        take: limit,
        orderBy: { id: 'desc' },
      }),
      this.prisma.expenseClaim.count({ where: { employeeId } }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /** POST /ess/expense-claims — Submit an expense claim */
  async submitExpenseClaim(
    userId: number,
    dto: { claimType: string; amount: number; receiptUrl?: string },
  ) {
    const employeeId = await this.resolveEmployeeId(userId);

    if (dto.amount <= 0) {
      throw new BadRequestException('Amount must be greater than zero');
    }

    const claim = await this.prisma.expenseClaim.create({
      data: {
        employeeId,
        claimType: dto.claimType,
        amount: new Prisma.Decimal(dto.amount),
        receiptUrl: dto.receiptUrl,
      },
    });

    this.logger.log(
      `ESS: Employee #${employeeId} submitted expense claim #${claim.id}`,
    );
    return claim;
  }

  /** GET /ess/reviews — Own performance reviews */
  async getMyReviews(userId: number) {
    const employeeId = await this.resolveEmployeeId(userId);

    return this.prisma.performanceReview.findMany({
      where: { revieweeId: employeeId },
      orderBy: { id: 'desc' },
    });
  }

  /** GET /ess/payslips — Own payroll items */
  async getMyPayslips(userId: number) {
    const employeeId = await this.resolveEmployeeId(userId);

    return this.prisma.payrollItem.findMany({
      where: { employeeId },
      include: {
        payrollRun: { select: { period: true, status: true } },
      },
      orderBy: { payrollRun: { period: 'desc' } },
    });
  }
}
