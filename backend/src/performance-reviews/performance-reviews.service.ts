// ─────────────────────────────────────────────────────────────────────────────
// PerformanceReviewsService — 360° performance appraisal management
// ─────────────────────────────────────────────────────────────────────────────

import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma';
import {
  CreatePerformanceReviewDto,
  UpdatePerformanceReviewDto,
  QueryPerformanceReviewDto,
} from './dto';

@Injectable()
export class PerformanceReviewsService {
  private readonly logger = new Logger(PerformanceReviewsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePerformanceReviewDto) {
    // Verify reviewee exists
    const reviewee = await this.prisma.employee.findUnique({
      where: { id: dto.revieweeId },
    });
    if (!reviewee)
      throw new NotFoundException(`Employee #${dto.revieweeId} not found`);

    const review = await this.prisma.performanceReview.create({
      data: dto,
      include: {
        reviewee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            department: true,
          },
        },
      },
    });
    this.logger.log(
      `Performance review created for Employee #${dto.revieweeId} by #${dto.reviewerId}`,
    );
    return review;
  }

  async findAll(query: QueryPerformanceReviewDto) {
    const { page = 1, limit = 20, revieweeId, reviewerId, period } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.PerformanceReviewWhereInput = {};
    if (revieweeId) where.revieweeId = revieweeId;
    if (reviewerId) where.reviewerId = reviewerId;
    if (period) where.period = period;

    const [data, total] = await Promise.all([
      this.prisma.performanceReview.findMany({
        where,
        skip,
        take: limit,
        include: {
          reviewee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              department: true,
            },
          },
        },
        orderBy: { id: 'desc' },
      }),
      this.prisma.performanceReview.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: number) {
    const review = await this.prisma.performanceReview.findUnique({
      where: { id },
      include: {
        reviewee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            department: true,
            jobTitle: true,
          },
        },
      },
    });
    if (!review)
      throw new NotFoundException(`Performance review #${id} not found`);
    return review;
  }

  async update(id: number, dto: UpdatePerformanceReviewDto) {
    await this.findOne(id);
    return this.prisma.performanceReview.update({
      where: { id },
      data: dto,
      include: {
        reviewee: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.performanceReview.delete({ where: { id } });
    return { message: `Performance review #${id} deleted` };
  }
}
