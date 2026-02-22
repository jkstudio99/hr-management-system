import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma';

@Injectable()
export class TrainingService {
  constructor(private readonly prisma: PrismaService) {}

  async createCourse(dto: { title: string; description?: string; instructor?: string; startDate?: string; endDate?: string; maxCapacity?: number }) {
    return this.prisma.trainingCourse.create({ data: { ...dto, startDate: dto.startDate ? new Date(dto.startDate) : undefined, endDate: dto.endDate ? new Date(dto.endDate) : undefined } });
  }

  async findAllCourses(query: { page?: number; limit?: number; isActive?: boolean }) {
    const { page = 1, limit = 20, isActive } = query;
    const where: Prisma.TrainingCourseWhereInput = {};
    if (isActive !== undefined) where.isActive = isActive;
    const [data, total] = await Promise.all([
      this.prisma.trainingCourse.findMany({ where, skip: (page - 1) * limit, take: limit, include: { _count: { select: { enrollments: true } } }, orderBy: { id: 'desc' } }),
      this.prisma.trainingCourse.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOneCourse(id: number) {
    const course = await this.prisma.trainingCourse.findUnique({ where: { id }, include: { enrollments: { include: { employee: { select: { id: true, firstName: true, lastName: true } } } } } });
    if (!course) throw new NotFoundException(`Course #${id} not found`);
    return course;
  }

  async updateCourse(id: number, dto: any) {
    await this.findOneCourse(id);
    return this.prisma.trainingCourse.update({ where: { id }, data: dto });
  }

  async removeCourse(id: number) {
    await this.findOneCourse(id);
    await this.prisma.trainingCourse.delete({ where: { id } });
    return { message: `Course #${id} deleted` };
  }

  async enroll(courseId: number, employeeId: number) {
    const course = await this.findOneCourse(courseId);
    if (!course.isActive) throw new BadRequestException('Course is not active');
    if (course.maxCapacity && course.enrollments.length >= course.maxCapacity) throw new BadRequestException('Course is full');
    try {
      return await this.prisma.trainingEnrollment.create({ data: { courseId, employeeId }, include: { course: { select: { title: true } }, employee: { select: { firstName: true, lastName: true } } } });
    } catch { throw new ConflictException('Already enrolled'); }
  }

  async updateEnrollment(id: number, dto: { status?: string; score?: number }) {
    const enrollment = await this.prisma.trainingEnrollment.findUnique({ where: { id } });
    if (!enrollment) throw new NotFoundException(`Enrollment #${id} not found`);
    const data: any = {};
    if (dto.status) data.status = dto.status;
    if (dto.score !== undefined) data.score = dto.score;
    if (dto.status === 'COMPLETED') data.completedAt = new Date();
    return this.prisma.trainingEnrollment.update({ where: { id }, data });
  }
}
