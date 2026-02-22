import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma';

@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: {
    employeeId?: number;
    title: string;
    category: string;
    fileUrl: string;
    fileSize?: number;
    mimeType?: string;
    uploadedBy?: number;
    expiryDate?: string;
  }) {
    return this.prisma.document.create({
      data: {
        ...dto,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : undefined,
      },
    });
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    category?: string;
    employeeId?: number;
  }) {
    const { page = 1, limit = 20, category, employeeId } = query;
    const where: Prisma.DocumentWhereInput = {};
    if (category) where.category = category;
    if (employeeId) where.employeeId = employeeId;
    const [data, total] = await Promise.all([
      this.prisma.document.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          employee: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { id: 'desc' },
      }),
      this.prisma.document.count({ where }),
    ]);
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: number) {
    const doc = await this.prisma.document.findUnique({
      where: { id },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    if (!doc) throw new NotFoundException(`Document #${id} not found`);
    return doc;
  }

  async update(id: number, dto: any) {
    await this.findOne(id);
    return this.prisma.document.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.document.delete({ where: { id } });
    return { message: `Document #${id} deleted` };
  }
}
