import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma';

@Injectable()
export class AnnouncementsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: { title: string; content: string; priority?: string; targetRole?: string; targetDeptId?: number; isPinned?: boolean; expiresAt?: string }, publishedBy: number) {
    return this.prisma.announcement.create({
      data: { ...dto, publishedBy, expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined },
    });
  }

  async findAll(query: { page?: number; limit?: number; role?: string }) {
    const { page = 1, limit = 20, role } = query;
    const where: Prisma.AnnouncementWhereInput = { isArchived: false };
    if (role) where.OR = [{ targetRole: null }, { targetRole: role }];
    const [data, total] = await Promise.all([
      this.prisma.announcement.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }] }),
      this.prisma.announcement.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: number) {
    const ann = await this.prisma.announcement.findUnique({ where: { id } });
    if (!ann) throw new NotFoundException(`Announcement #${id} not found`);
    return ann;
  }

  async update(id: number, dto: any) {
    await this.findOne(id);
    return this.prisma.announcement.update({ where: { id }, data: dto });
  }

  async archive(id: number) {
    await this.findOne(id);
    return this.prisma.announcement.update({ where: { id }, data: { isArchived: true } });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.announcement.delete({ where: { id } });
    return { message: `Announcement #${id} deleted` };
  }
}
