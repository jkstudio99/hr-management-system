import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma';

@Injectable()
export class BenefitsService {
  constructor(private readonly prisma: PrismaService) {}

  async createPlan(dto: { name: string; description?: string; type: string }) {
    try { return await this.prisma.benefitPlan.create({ data: dto }); }
    catch { throw new ConflictException(`Plan "${dto.name}" already exists`); }
  }

  async findAllPlans(query: { page?: number; limit?: number }) {
    const { page = 1, limit = 20 } = query;
    const [data, total] = await Promise.all([
      this.prisma.benefitPlan.findMany({ skip: (page - 1) * limit, take: limit, include: { _count: { select: { employees: true } } }, orderBy: { id: 'desc' } }),
      this.prisma.benefitPlan.count(),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOnePlan(id: number) {
    const plan = await this.prisma.benefitPlan.findUnique({ where: { id }, include: { employees: { include: { employee: { select: { id: true, firstName: true, lastName: true } } } } } });
    if (!plan) throw new NotFoundException(`Plan #${id} not found`);
    return plan;
  }

  async updatePlan(id: number, dto: any) {
    await this.findOnePlan(id);
    return this.prisma.benefitPlan.update({ where: { id }, data: dto });
  }

  async removePlan(id: number) {
    await this.findOnePlan(id);
    await this.prisma.benefitPlan.delete({ where: { id } });
    return { message: `Plan #${id} deleted` };
  }

  async enrollEmployee(planId: number, employeeId: number, startDate: string) {
    await this.findOnePlan(planId);
    try {
      return await this.prisma.employeeBenefit.create({ data: { planId, employeeId, startDate: new Date(startDate) } });
    } catch { throw new ConflictException('Employee already enrolled in this plan'); }
  }

  async unenroll(id: number) {
    const eb = await this.prisma.employeeBenefit.findUnique({ where: { id } });
    if (!eb) throw new NotFoundException(`Enrollment #${id} not found`);
    return this.prisma.employeeBenefit.update({ where: { id }, data: { isActive: false, endDate: new Date() } });
  }
}
