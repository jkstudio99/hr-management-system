// ─────────────────────────────────────────────────────────────────────────────
// JobHistoriesService — Internal mobility / promotion / transfer timeline
// ─────────────────────────────────────────────────────────────────────────────
// Tracks when employees change job titles (promotions, lateral moves, etc.)
// Each entry records: old title → new title + effective date.
// ─────────────────────────────────────────────────────────────────────────────

import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma';
import { CreateJobHistoryDto, UpdateJobHistoryDto, QueryJobHistoryDto } from './dto';

@Injectable()
export class JobHistoriesService {
    private readonly logger = new Logger(JobHistoriesService.name);

    constructor(private readonly prisma: PrismaService) { }

    async create(dto: CreateJobHistoryDto) {
        // Verify employee exists
        const employee = await this.prisma.employee.findUnique({ where: { id: dto.employeeId } });
        if (!employee) throw new NotFoundException(`Employee #${dto.employeeId} not found`);

        // Verify both job titles exist
        const [oldTitle, newTitle] = await Promise.all([
            this.prisma.jobTitle.findUnique({ where: { id: dto.oldTitleId } }),
            this.prisma.jobTitle.findUnique({ where: { id: dto.newTitleId } }),
        ]);
        if (!oldTitle) throw new NotFoundException(`Job title #${dto.oldTitleId} not found`);
        if (!newTitle) throw new NotFoundException(`Job title #${dto.newTitleId} not found`);

        const history = await this.prisma.jobHistory.create({
            data: {
                employeeId: dto.employeeId,
                oldTitleId: dto.oldTitleId,
                newTitleId: dto.newTitleId,
                effectiveDate: new Date(dto.effectiveDate),
            },
            include: {
                employee: { select: { id: true, firstName: true, lastName: true } },
            },
        });

        this.logger.log(
            `Job history created: Employee #${dto.employeeId} moved from title #${dto.oldTitleId} → #${dto.newTitleId}`,
        );
        return history;
    }

    async findAll(query: QueryJobHistoryDto) {
        const { page = 1, limit = 20, employeeId } = query;
        const skip = (page - 1) * limit;

        const where: Prisma.JobHistoryWhereInput = {};
        if (employeeId) where.employeeId = employeeId;

        const [data, total] = await Promise.all([
            this.prisma.jobHistory.findMany({
                where,
                skip,
                take: limit,
                include: {
                    employee: { select: { id: true, firstName: true, lastName: true, department: true, jobTitle: true } },
                },
                orderBy: { effectiveDate: 'desc' },
            }),
            this.prisma.jobHistory.count({ where }),
        ]);

        return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }

    async findOne(id: number) {
        const history = await this.prisma.jobHistory.findUnique({
            where: { id },
            include: {
                employee: { select: { id: true, firstName: true, lastName: true, department: true, jobTitle: true } },
            },
        });
        if (!history) throw new NotFoundException(`Job history #${id} not found`);
        return history;
    }

    /** Get complete career timeline for a specific employee */
    async getTimeline(employeeId: number) {
        const employee = await this.prisma.employee.findUnique({ where: { id: employeeId } });
        if (!employee) throw new NotFoundException(`Employee #${employeeId} not found`);

        return this.prisma.jobHistory.findMany({
            where: { employeeId },
            orderBy: { effectiveDate: 'desc' },
        });
    }

    async update(id: number, dto: UpdateJobHistoryDto) {
        await this.findOne(id);
        const data: any = { ...dto };
        if (dto.effectiveDate) data.effectiveDate = new Date(dto.effectiveDate);

        return this.prisma.jobHistory.update({
            where: { id },
            data,
            include: { employee: { select: { id: true, firstName: true, lastName: true } } },
        });
    }

    async remove(id: number) {
        await this.findOne(id);
        await this.prisma.jobHistory.delete({ where: { id } });
        return { message: `Job history #${id} deleted` };
    }
}
