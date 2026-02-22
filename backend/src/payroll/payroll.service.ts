// ─────────────────────────────────────────────────────────────────────────────
// PayrollService — Monthly payroll processing
// ─────────────────────────────────────────────────────────────────────────────
// Business rules:
//   • Create a payroll run for a period (YYYY-MM), auto-populate from active employees
//   • Process: calculate tax, SSO, net pay for each item
//   • SSO = 5% of baseSalary, capped at 750 THB
//   • Tax = simplified flat rate (default 5%)
//   • NetPay = baseSalary + allowances - deductions - tax - sso
//   • Only DRAFT runs can be processed; only PROCESSING runs can be completed
//   • Period is unique — cannot create duplicate runs
// ─────────────────────────────────────────────────────────────────────────────

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma';
import {
  CreatePayrollRunDto,
  ProcessPayrollDto,
  UpdatePayrollItemDto,
  QueryPayrollDto,
} from './dto';

const SSO_RATE_DEFAULT = 0.05;
const SSO_CAP = 750;
const TAX_RATE_DEFAULT = 0.05;

@Injectable()
export class PayrollService {
  private readonly logger = new Logger(PayrollService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Create a new payroll run and auto-populate items from active employees */
  async create(dto: CreatePayrollRunDto, processedBy: number) {
    // Check for duplicate period
    const existing = await this.prisma.payrollRun.findUnique({
      where: { period: dto.period },
    });
    if (existing) {
      throw new ConflictException(
        `Payroll run for period ${dto.period} already exists`,
      );
    }

    // Get all active employees
    const employees = await this.prisma.employee.findMany({
      where: { isActive: true },
      select: { id: true, baseSalary: true },
    });

    if (employees.length === 0) {
      throw new BadRequestException('No active employees found');
    }

    // Create run + items in transaction
    const run = await this.prisma.payrollRun.create({
      data: {
        period: dto.period,
        processedBy,
        items: {
          create: employees.map((emp) => ({
            employeeId: emp.id,
            baseSalary: emp.baseSalary,
            allowances: new Prisma.Decimal(0),
            deductions: new Prisma.Decimal(0),
            tax: new Prisma.Decimal(0),
            sso: new Prisma.Decimal(0),
            netPay: emp.baseSalary, // Initially netPay = baseSalary
          })),
        },
      },
      include: {
        items: {
          include: {
            employee: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
        },
      },
    });

    this.logger.log(
      `Payroll run created: ${dto.period} with ${employees.length} employees`,
    );
    return run;
  }

  async findAll(query: QueryPayrollDto) {
    const { page = 1, limit = 20, status } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.PayrollRunWhereInput = {};
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.payrollRun.findMany({
        where,
        skip,
        take: limit,
        include: { _count: { select: { items: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.payrollRun.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: number) {
    const run = await this.prisma.payrollRun.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            employee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                department: true,
                jobTitle: true,
              },
            },
          },
          orderBy: { employee: { firstName: 'asc' } },
        },
      },
    });
    if (!run) throw new NotFoundException(`Payroll run #${id} not found`);
    return run;
  }

  /** Update individual payroll item (allowances/deductions) */
  async updateItem(itemId: number, dto: UpdatePayrollItemDto) {
    const item = await this.prisma.payrollItem.findUnique({
      where: { id: itemId },
      include: { payrollRun: { select: { status: true } } },
    });
    if (!item) throw new NotFoundException(`Payroll item #${itemId} not found`);
    if (item.payrollRun.status === 'COMPLETED') {
      throw new BadRequestException(
        'Cannot modify items in a completed payroll run',
      );
    }

    const allowances =
      dto.allowances !== undefined
        ? new Prisma.Decimal(dto.allowances)
        : item.allowances;
    const deductions =
      dto.deductions !== undefined
        ? new Prisma.Decimal(dto.deductions)
        : item.deductions;

    return this.prisma.payrollItem.update({
      where: { id: itemId },
      data: { allowances, deductions },
    });
  }

  /** Process payroll — calculate tax, SSO, netPay for all items */
  async process(id: number, dto?: ProcessPayrollDto) {
    const run = await this.findOne(id);
    if (run.status !== 'DRAFT') {
      throw new BadRequestException(
        `Can only process DRAFT payroll runs (current: ${run.status})`,
      );
    }

    const ssoRate = dto?.ssoRate ?? SSO_RATE_DEFAULT;
    const taxRate = dto?.taxRate ?? TAX_RATE_DEFAULT;

    let totalAmount = new Prisma.Decimal(0);

    // Process each item in a transaction
    await this.prisma.$transaction(async (tx) => {
      for (const item of run.items) {
        const base = Number(item.baseSalary);
        const allow = Number(item.allowances);
        const deduct = Number(item.deductions);

        const grossPay = base + allow;
        const sso = Math.min(base * ssoRate, SSO_CAP);
        const tax = grossPay * taxRate;
        const netPay = grossPay - deduct - tax - sso;

        await tx.payrollItem.update({
          where: { id: item.id },
          data: {
            tax: new Prisma.Decimal(tax.toFixed(2)),
            sso: new Prisma.Decimal(sso.toFixed(2)),
            netPay: new Prisma.Decimal(Math.max(netPay, 0).toFixed(2)),
          },
        });

        totalAmount = totalAmount.add(
          new Prisma.Decimal(Math.max(netPay, 0).toFixed(2)),
        );
      }

      await tx.payrollRun.update({
        where: { id },
        data: { status: 'PROCESSING', totalAmount },
      });
    });

    this.logger.log(
      `Payroll #${id} processed — total: ฿${totalAmount.toString()}`,
    );
    return this.findOne(id);
  }

  /** Complete a processed payroll run */
  async complete(id: number) {
    const run = await this.findOne(id);
    if (run.status !== 'PROCESSING') {
      throw new BadRequestException(
        `Can only complete PROCESSING payroll runs (current: ${run.status})`,
      );
    }

    await this.prisma.payrollRun.update({
      where: { id },
      data: { status: 'COMPLETED' },
    });

    this.logger.log(`Payroll #${id} completed`);
    return this.findOne(id);
  }

  /** Delete a DRAFT payroll run */
  async remove(id: number) {
    const run = await this.findOne(id);
    if (run.status !== 'DRAFT') {
      throw new BadRequestException('Can only delete DRAFT payroll runs');
    }

    await this.prisma.payrollRun.delete({ where: { id } });
    this.logger.log(`Payroll run #${id} deleted`);
    return { message: `Payroll run #${id} deleted` };
  }
}
