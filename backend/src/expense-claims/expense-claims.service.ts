// ─────────────────────────────────────────────────────────────────────────────
// ExpenseClaimsService — Expense / reimbursement claim management
// ─────────────────────────────────────────────────────────────────────────────
// Business rules:
//   • Employees submit claims with type + amount + optional receipt
//   • Admin/HR approve or reject claims
//   • Only PENDING claims can change status
//   • Amount must be positive
// ─────────────────────────────────────────────────────────────────────────────

import {
    Injectable,
    NotFoundException,
    BadRequestException,
    Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma';
import { CreateExpenseClaimDto, UpdateExpenseClaimDto, QueryExpenseClaimDto } from './dto';

@Injectable()
export class ExpenseClaimsService {
    private readonly logger = new Logger(ExpenseClaimsService.name);

    constructor(private readonly prisma: PrismaService) { }

    async create(dto: CreateExpenseClaimDto) {
        const employee = await this.prisma.employee.findUnique({
            where: { id: dto.employeeId },
        });
        if (!employee) {
            throw new NotFoundException(`Employee #${dto.employeeId} not found`);
        }

        const claim = await this.prisma.expenseClaim.create({
            data: {
                employeeId: dto.employeeId,
                claimType: dto.claimType,
                amount: new Prisma.Decimal(dto.amount),
                receiptUrl: dto.receiptUrl,
            },
            include: {
                employee: { select: { id: true, firstName: true, lastName: true, department: true } },
            },
        });

        this.logger.log(`Expense claim created: #${claim.id} — ${dto.claimType} ฿${dto.amount}`);
        return claim;
    }

    async findAll(query: QueryExpenseClaimDto) {
        const { page = 1, limit = 20, employeeId, status, claimType } = query;
        const skip = (page - 1) * limit;

        const where: Prisma.ExpenseClaimWhereInput = {};
        if (employeeId) where.employeeId = employeeId;
        if (status) where.status = status;
        if (claimType) where.claimType = claimType;

        const [data, total] = await Promise.all([
            this.prisma.expenseClaim.findMany({
                where,
                skip,
                take: limit,
                include: {
                    employee: { select: { id: true, firstName: true, lastName: true, department: true } },
                },
                orderBy: { id: 'desc' },
            }),
            this.prisma.expenseClaim.count({ where }),
        ]);

        return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }

    async findOne(id: number) {
        const claim = await this.prisma.expenseClaim.findUnique({
            where: { id },
            include: {
                employee: {
                    select: { id: true, firstName: true, lastName: true, department: true, jobTitle: true },
                },
            },
        });
        if (!claim) throw new NotFoundException(`Expense claim #${id} not found`);
        return claim;
    }

    async update(id: number, dto: UpdateExpenseClaimDto) {
        const existing = await this.findOne(id);

        // Prevent status change on already-decided claims
        if (dto.status && existing.status !== 'PENDING' && dto.status !== existing.status) {
            throw new BadRequestException(
                `Cannot change status of a ${existing.status} claim`,
            );
        }

        const data: any = { ...dto };
        if (dto.amount !== undefined) data.amount = new Prisma.Decimal(dto.amount);

        const updated = await this.prisma.expenseClaim.update({
            where: { id },
            data,
            include: {
                employee: { select: { id: true, firstName: true, lastName: true } },
            },
        });

        this.logger.log(`Expense claim #${id} updated → ${updated.status}`);
        return updated;
    }

    async remove(id: number) {
        await this.findOne(id);
        await this.prisma.expenseClaim.delete({ where: { id } });
        this.logger.log(`Expense claim #${id} deleted`);
        return { message: `Expense claim #${id} deleted successfully` };
    }
}
