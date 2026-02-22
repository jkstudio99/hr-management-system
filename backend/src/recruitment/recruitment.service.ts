import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma';

@Injectable()
export class RecruitmentService {
  private readonly logger = new Logger(RecruitmentService.name);
  constructor(private readonly prisma: PrismaService) {}

  // ── Job Postings ─────────────────────────────────────────────────────────

  async createPosting(dto: {
    title: string;
    departmentId?: number;
    description: string;
    requirements?: string;
    location?: string;
    salaryMin?: number;
    salaryMax?: number;
  }) {
    return this.prisma.jobPosting.create({
      data: {
        ...dto,
        salaryMin: dto.salaryMin ? new Prisma.Decimal(dto.salaryMin) : undefined,
        salaryMax: dto.salaryMax ? new Prisma.Decimal(dto.salaryMax) : undefined,
      },
      include: { applicants: true },
    });
  }

  async findAllPostings(query: { page?: number; limit?: number; status?: string }) {
    const { page = 1, limit = 20, status } = query;
    const where: Prisma.JobPostingWhereInput = {};
    if (status) where.status = status;
    const [data, total] = await Promise.all([
      this.prisma.jobPosting.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { _count: { select: { applicants: true } } },
        orderBy: { id: 'desc' },
      }),
      this.prisma.jobPosting.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOnePosting(id: number) {
    const posting = await this.prisma.jobPosting.findUnique({
      where: { id },
      include: { applicants: { orderBy: { createdAt: 'desc' } } },
    });
    if (!posting) throw new NotFoundException(`Job posting #${id} not found`);
    return posting;
  }

  async updatePosting(id: number, dto: Partial<{ title: string; description: string; requirements: string; location: string; status: string }>) {
    await this.findOnePosting(id);
    return this.prisma.jobPosting.update({ where: { id }, data: dto });
  }

  async removePosting(id: number) {
    await this.findOnePosting(id);
    await this.prisma.jobPosting.delete({ where: { id } });
    return { message: `Job posting #${id} deleted` };
  }

  // ── Applicants ───────────────────────────────────────────────────────────

  async createApplicant(postingId: number, dto: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    resumeUrl?: string;
  }) {
    await this.findOnePosting(postingId);
    return this.prisma.applicant.create({
      data: { ...dto, jobPostingId: postingId },
    });
  }

  async updateApplicantStage(id: number, stage: string) {
    const valid = ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED'];
    if (!valid.includes(stage)) throw new BadRequestException(`Invalid stage: ${stage}`);
    const app = await this.prisma.applicant.findUnique({ where: { id } });
    if (!app) throw new NotFoundException(`Applicant #${id} not found`);
    this.logger.log(`Applicant #${id} stage: ${app.stage} → ${stage}`);
    return this.prisma.applicant.update({ where: { id }, data: { stage } });
  }
}
