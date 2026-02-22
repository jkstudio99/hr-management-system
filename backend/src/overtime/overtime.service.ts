import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma';

@Injectable()
export class OvertimeService {
  private readonly logger = new Logger(OvertimeService.name);
  constructor(private readonly prisma: PrismaService) {}

  // ── OT Requests ──────────────────────────────────────────────────────────

  async createOtRequest(dto: { employeeId: number; date: string; hours: number; reason?: string }) {
    const emp = await this.prisma.employee.findUnique({ where: { id: dto.employeeId } });
    if (!emp) throw new NotFoundException(`Employee #${dto.employeeId} not found`);
    return this.prisma.overtimeRequest.create({
      data: { employeeId: dto.employeeId, date: new Date(dto.date), hours: new Prisma.Decimal(dto.hours), reason: dto.reason },
      include: { employee: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  async findAllOtRequests(query: { page?: number; limit?: number; status?: string; employeeId?: number }) {
    const { page = 1, limit = 20, status, employeeId } = query;
    const where: Prisma.OvertimeRequestWhereInput = {};
    if (status) where.status = status;
    if (employeeId) where.employeeId = employeeId;
    const [data, total] = await Promise.all([
      this.prisma.overtimeRequest.findMany({ where, skip: (page - 1) * limit, take: limit, include: { employee: { select: { id: true, firstName: true, lastName: true } } }, orderBy: { id: 'desc' } }),
      this.prisma.overtimeRequest.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async approveOt(id: number, approverId: number) {
    const ot = await this.prisma.overtimeRequest.findUnique({ where: { id } });
    if (!ot) throw new NotFoundException(`OT request #${id} not found`);
    if (ot.status !== 'PENDING') throw new BadRequestException(`OT #${id} is already ${ot.status}`);
    return this.prisma.overtimeRequest.update({ where: { id }, data: { status: 'APPROVED', approverId } });
  }

  async rejectOt(id: number, approverId: number) {
    const ot = await this.prisma.overtimeRequest.findUnique({ where: { id } });
    if (!ot) throw new NotFoundException(`OT request #${id} not found`);
    if (ot.status !== 'PENDING') throw new BadRequestException(`OT #${id} is already ${ot.status}`);
    return this.prisma.overtimeRequest.update({ where: { id }, data: { status: 'REJECTED', approverId } });
  }

  // ── Timesheet ────────────────────────────────────────────────────────────

  async clockIn(employeeId: number) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const existing = await this.prisma.timesheetEntry.findUnique({ where: { employeeId_date: { employeeId, date: today } } });
    if (existing?.clockIn) throw new BadRequestException('Already clocked in today');
    return this.prisma.timesheetEntry.upsert({
      where: { employeeId_date: { employeeId, date: today } },
      create: { employeeId, date: today, clockIn: new Date() },
      update: { clockIn: new Date() },
    });
  }

  async clockOut(employeeId: number) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const entry = await this.prisma.timesheetEntry.findUnique({ where: { employeeId_date: { employeeId, date: today } } });
    if (!entry?.clockIn) throw new BadRequestException('Must clock in first');
    if (entry.clockOut) throw new BadRequestException('Already clocked out today');
    const clockOut = new Date();
    const diffMs = clockOut.getTime() - entry.clockIn.getTime();
    const totalHours = Number((diffMs / 3600000).toFixed(1));
    return this.prisma.timesheetEntry.update({
      where: { id: entry.id },
      data: { clockOut, totalHours: new Prisma.Decimal(totalHours) },
    });
  }

  async getTimesheet(employeeId: number, month?: string) {
    const where: Prisma.TimesheetEntryWhereInput = { employeeId };
    if (month) {
      const [y, m] = month.split('-').map(Number);
      where.date = { gte: new Date(y, m - 1, 1), lt: new Date(y, m, 1) };
    }
    return this.prisma.timesheetEntry.findMany({ where, orderBy: { date: 'desc' } });
  }
}
