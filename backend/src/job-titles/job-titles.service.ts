// ─────────────────────────────────────────────────────────────────────────────
// JobTitlesService — Business logic for job titles / positions
// ─────────────────────────────────────────────────────────────────────────────

import {
    Injectable,
    NotFoundException,
    ConflictException,
    Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma';
import { CreateJobTitleDto, UpdateJobTitleDto } from './dto';

@Injectable()
export class JobTitlesService {
    private readonly logger = new Logger(JobTitlesService.name);

    constructor(private readonly prisma: PrismaService) { }

    async create(dto: CreateJobTitleDto) {
        try {
            const jobTitle = await this.prisma.jobTitle.create({ data: dto });
            this.logger.log(`Job title created: ${jobTitle.titleName}`);
            return jobTitle;
        } catch (error: any) {
            if (error.code === 'P2002') {
                throw new ConflictException('Job title already exists');
            }
            throw error;
        }
    }

    async findAll() {
        return this.prisma.jobTitle.findMany({
            include: { _count: { select: { employees: true } } },
            orderBy: { titleName: 'asc' },
        });
    }

    async findOne(id: number) {
        const jobTitle = await this.prisma.jobTitle.findUnique({
            where: { id },
            include: {
                employees: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        department: true,
                        isActive: true,
                    },
                },
            },
        });

        if (!jobTitle) {
            throw new NotFoundException(`Job title #${id} not found`);
        }

        return jobTitle;
    }

    async update(id: number, dto: UpdateJobTitleDto) {
        await this.findOne(id);

        try {
            const updated = await this.prisma.jobTitle.update({
                where: { id },
                data: dto,
            });
            this.logger.log(`Job title updated: #${id}`);
            return updated;
        } catch (error: any) {
            if (error.code === 'P2002') {
                throw new ConflictException('Job title already exists');
            }
            throw error;
        }
    }

    async remove(id: number) {
        await this.findOne(id);
        await this.prisma.jobTitle.delete({ where: { id } });
        this.logger.log(`Job title deleted: #${id}`);
        return { message: `Job title #${id} deleted successfully` };
    }
}
