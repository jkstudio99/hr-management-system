import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma';

@Injectable()
export class ShiftsService {
  constructor(private readonly prisma: PrismaService) {}

  async createShift(dto: { name: string; startTime: string; endTime: string; color?: string }) {
    try { return await this.prisma.shift.create({ data: dto }); }
    catch { throw new ConflictException(`Shift "${dto.name}" already exists`); }
  }

  async findAllShifts() {
    return this.prisma.shift.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
  }

  async updateShift(id: number, dto: any) {
    const shift = await this.prisma.shift.findUnique({ where: { id } });
    if (!shift) throw new NotFoundException(`Shift #${id} not found`);
    return this.prisma.shift.update({ where: { id }, data: dto });
  }

  async assignShift(dto: { shiftId: number; employeeId: number; date: string; note?: string }) {
    try {
      return await this.prisma.shiftAssignment.create({
        data: { shiftId: dto.shiftId, employeeId: dto.employeeId, date: new Date(dto.date), note: dto.note },
        include: { shift: true, employee: { select: { id: true, firstName: true, lastName: true } } },
      });
    } catch { throw new ConflictException('Employee already has a shift on this date'); }
  }

  async getSchedule(query: { employeeId?: number; startDate?: string; endDate?: string }) {
    const where: Prisma.ShiftAssignmentWhereInput = {};
    if (query.employeeId) where.employeeId = query.employeeId;
    if (query.startDate || query.endDate) {
      where.date = {};
      if (query.startDate) where.date.gte = new Date(query.startDate);
      if (query.endDate) where.date.lte = new Date(query.endDate);
    }
    return this.prisma.shiftAssignment.findMany({
      where,
      include: { shift: true, employee: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { date: 'asc' },
    });
  }

  async removeAssignment(id: number) {
    const a = await this.prisma.shiftAssignment.findUnique({ where: { id } });
    if (!a) throw new NotFoundException(`Assignment #${id} not found`);
    await this.prisma.shiftAssignment.delete({ where: { id } });
    return { message: `Assignment #${id} deleted` };
  }
}
