// ─────────────────────────────────────────────────────────────────────────────
// ExitChecklistsService — Offboarding checklist management
// ─────────────────────────────────────────────────────────────────────────────
// Auto-generates standard checklist items when triggered.
// Each department signs off on their responsibilities.
// ─────────────────────────────────────────────────────────────────────────────

import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma';
import { CreateExitChecklistDto, UpdateExitChecklistDto, QueryExitChecklistDto } from './dto';

/** Default checklist items auto-created when an employee exits. */
const DEFAULT_EXIT_ITEMS = [
    'Return employee ID badge',
    'Return laptop/computer equipment',
    'Return company mobile phone',
    'Return company vehicle keys',
    'Revoke email and system access',
    'Complete knowledge transfer documentation',
    'Return parking pass / access cards',
    'Settle pending expense claims',
    'Exit interview completed',
    'Final payroll processed',
];

@Injectable()
export class ExitChecklistsService {
    private readonly logger = new Logger(ExitChecklistsService.name);

    constructor(private readonly prisma: PrismaService) { }

    async create(dto: CreateExitChecklistDto) {
        const employee = await this.prisma.employee.findUnique({ where: { id: dto.employeeId } });
        if (!employee) throw new NotFoundException(`Employee #${dto.employeeId} not found`);

        return this.prisma.exitChecklist.create({
            data: dto,
            include: { employee: { select: { id: true, firstName: true, lastName: true } } },
        });
    }

    /** Auto-generate full exit checklist for an employee. */
    async generateForEmployee(employeeId: number) {
        const employee = await this.prisma.employee.findUnique({ where: { id: employeeId } });
        if (!employee) throw new NotFoundException(`Employee #${employeeId} not found`);

        const items = await this.prisma.exitChecklist.createMany({
            data: DEFAULT_EXIT_ITEMS.map((itemName) => ({ employeeId, itemName })),
            skipDuplicates: true,
        });

        this.logger.log(`Generated ${items.count} exit checklist items for Employee #${employeeId}`);

        return this.prisma.exitChecklist.findMany({
            where: { employeeId },
            include: { employee: { select: { id: true, firstName: true, lastName: true } } },
            orderBy: { id: 'asc' },
        });
    }

    async findAll(query: QueryExitChecklistDto) {
        const { page = 1, limit = 50, employeeId } = query;
        const skip = (page - 1) * limit;

        const where: Prisma.ExitChecklistWhereInput = {};
        if (employeeId) where.employeeId = employeeId;

        const [data, total] = await Promise.all([
            this.prisma.exitChecklist.findMany({
                where, skip, take: limit,
                include: { employee: { select: { id: true, firstName: true, lastName: true } } },
                orderBy: { id: 'asc' },
            }),
            this.prisma.exitChecklist.count({ where }),
        ]);

        return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }

    async findOne(id: number) {
        const item = await this.prisma.exitChecklist.findUnique({
            where: { id },
            include: { employee: { select: { id: true, firstName: true, lastName: true, department: true } } },
        });
        if (!item) throw new NotFoundException(`Exit checklist item #${id} not found`);
        return item;
    }

    async update(id: number, dto: UpdateExitChecklistDto) {
        await this.findOne(id);
        return this.prisma.exitChecklist.update({
            where: { id }, data: dto,
            include: { employee: { select: { id: true, firstName: true, lastName: true } } },
        });
    }

    async remove(id: number) {
        await this.findOne(id);
        await this.prisma.exitChecklist.delete({ where: { id } });
        return { message: `Exit checklist item #${id} deleted` };
    }
}
