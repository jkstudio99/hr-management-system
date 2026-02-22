import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma';

@Injectable()
export class OrgChartService {
  constructor(private readonly prisma: PrismaService) {}

  async getTree() {
    const employees = await this.prisma.employee.findMany({
      where: { isActive: true },
      select: {
        id: true, firstName: true, lastName: true, managerId: true,
        department: { select: { departmentName: true } },
        jobTitle: { select: { titleName: true } },
      },
      orderBy: { firstName: 'asc' },
    });
    const roots = employees.filter((e) => !e.managerId);
    const buildTree = (parentId: number): any[] =>
      employees.filter((e) => e.managerId === parentId).map((e) => ({ ...e, subordinates: buildTree(e.id) }));
    return roots.map((r) => ({ ...r, subordinates: buildTree(r.id) }));
  }

  async getSubordinates(employeeId: number) {
    const emp = await this.prisma.employee.findUnique({ where: { id: employeeId } });
    if (!emp) throw new NotFoundException(`Employee #${employeeId} not found`);
    return this.prisma.employee.findMany({
      where: { managerId: employeeId, isActive: true },
      select: { id: true, firstName: true, lastName: true, department: { select: { departmentName: true } }, jobTitle: { select: { titleName: true } } },
    });
  }

  async setManager(employeeId: number, managerId: number | null) {
    const emp = await this.prisma.employee.findUnique({ where: { id: employeeId } });
    if (!emp) throw new NotFoundException(`Employee #${employeeId} not found`);
    if (managerId) {
      const mgr = await this.prisma.employee.findUnique({ where: { id: managerId } });
      if (!mgr) throw new NotFoundException(`Manager #${managerId} not found`);
    }
    return this.prisma.employee.update({ where: { id: employeeId }, data: { managerId } });
  }
}
