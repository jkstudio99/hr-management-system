import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma';

@Injectable()
export class GoalsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: { employeeId: number; title: string; description?: string; period: string; keyResults?: { title: string; targetValue: number; unit?: string }[] }) {
    return this.prisma.goal.create({
      data: {
        employeeId: dto.employeeId, title: dto.title, description: dto.description, period: dto.period,
        keyResults: dto.keyResults ? { create: dto.keyResults.map((kr) => ({ title: kr.title, targetValue: new Prisma.Decimal(kr.targetValue), unit: kr.unit })) } : undefined,
      },
      include: { keyResults: true },
    });
  }

  async findAll(query: { page?: number; limit?: number; employeeId?: number; period?: string }) {
    const { page = 1, limit = 20, employeeId, period } = query;
    const where: Prisma.GoalWhereInput = {};
    if (employeeId) where.employeeId = employeeId;
    if (period) where.period = period;
    const [data, total] = await Promise.all([
      this.prisma.goal.findMany({ where, skip: (page - 1) * limit, take: limit, include: { keyResults: true, employee: { select: { id: true, firstName: true, lastName: true } } }, orderBy: { id: 'desc' } }),
      this.prisma.goal.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: number) {
    const goal = await this.prisma.goal.findUnique({ where: { id }, include: { keyResults: true, employee: { select: { id: true, firstName: true, lastName: true } } } });
    if (!goal) throw new NotFoundException(`Goal #${id} not found`);
    return goal;
  }

  async update(id: number, dto: { title?: string; status?: string; progress?: number }) {
    await this.findOne(id);
    return this.prisma.goal.update({ where: { id }, data: dto, include: { keyResults: true } });
  }

  async updateKeyResult(id: number, dto: { currentValue?: number; title?: string }) {
    const kr = await this.prisma.keyResult.findUnique({ where: { id } });
    if (!kr) throw new NotFoundException(`Key result #${id} not found`);
    const data: any = {};
    if (dto.title) data.title = dto.title;
    if (dto.currentValue !== undefined) data.currentValue = new Prisma.Decimal(dto.currentValue);
    return this.prisma.keyResult.update({ where: { id }, data });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.goal.delete({ where: { id } });
    return { message: `Goal #${id} deleted` };
  }
}
