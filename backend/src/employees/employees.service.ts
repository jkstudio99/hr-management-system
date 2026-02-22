// ─────────────────────────────────────────────────────────────────────────────
// EmployeesService — Core HR employee management logic
// ─────────────────────────────────────────────────────────────────────────────
// Features:
//   • Paginated listing with search across firstName, lastName, idCard
//   • Filtering by department, job title, active status
//   • Nested relations on single fetch (department, jobTitle, user, etc.)
//   • Conflict detection for duplicate idCard
// ─────────────────────────────────────────────────────────────────────────────

import {
    Injectable,
    NotFoundException,
    ConflictException,
    Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma';
import { CreateEmployeeDto, UpdateEmployeeDto, QueryEmployeeDto } from './dto';

@Injectable()
export class EmployeesService {
    private readonly logger = new Logger(EmployeesService.name);

    constructor(private readonly prisma: PrismaService) { }

    // ── Create ────────────────────────────────────────────────────────────

    async create(dto: CreateEmployeeDto) {
        try {
            const employee = await this.prisma.employee.create({
                data: {
                    ...dto,
                    hireDate: new Date(dto.hireDate),
                    baseSalary: new Prisma.Decimal(dto.baseSalary),
                },
                include: { department: true, jobTitle: true },
            });

            this.logger.log(
                `Employee created: ${employee.firstName} ${employee.lastName}`,
            );
            return employee;
        } catch (error: any) {
            if (error.code === 'P2002') {
                throw new ConflictException('Employee with this ID card already exists');
            }
            if (error.code === 'P2003') {
                throw new NotFoundException(
                    'Referenced department or job title does not exist',
                );
            }
            throw error;
        }
    }

    // ── List with Pagination & Search ─────────────────────────────────────

    async findAll(query: QueryEmployeeDto) {
        const { page = 1, limit = 20, search, departmentId, jobTitleId, isActive } = query;
        const skip = (page - 1) * limit;

        // ── Build dynamic WHERE clause ────────────────────────────────────
        const where: Prisma.EmployeeWhereInput = {};

        if (search) {
            where.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { idCard: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (departmentId) {
            where.departmentId = departmentId;
        }

        if (jobTitleId) {
            where.jobTitleId = jobTitleId;
        }

        if (isActive !== undefined) {
            where.isActive = isActive === 'true';
        }

        // ── Execute count + query in parallel for performance ─────────────
        const [data, total] = await Promise.all([
            this.prisma.employee.findMany({
                where,
                skip,
                take: limit,
                include: { department: true, jobTitle: true },
                orderBy: { id: 'desc' },
            }),
            this.prisma.employee.count({ where }),
        ]);

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    // ── Find One (with full nested relations) ─────────────────────────────

    async findOne(id: number) {
        const employee = await this.prisma.employee.findUnique({
            where: { id },
            include: {
                department: true,
                jobTitle: true,
                user: { select: { id: true, username: true, email: true, role: true } },
                leaveRequests: { orderBy: { startDate: 'desc' }, take: 10 },
                assets: true,
                expenseClaims: { orderBy: { id: 'desc' }, take: 10 },
                performanceReviews: { orderBy: { id: 'desc' }, take: 5 },
                exitChecklists: true,
                jobHistories: { orderBy: { effectiveDate: 'desc' } },
            },
        });

        if (!employee) {
            throw new NotFoundException(`Employee #${id} not found`);
        }

        return employee;
    }

    // ── Update ────────────────────────────────────────────────────────────

    async update(id: number, dto: UpdateEmployeeDto) {
        await this.findOne(id); // ensure exists

        try {
            const data: any = { ...dto };

            // Convert date and decimal fields if present
            if (dto.hireDate) data.hireDate = new Date(dto.hireDate);
            if (dto.baseSalary !== undefined)
                data.baseSalary = new Prisma.Decimal(dto.baseSalary);

            const updated = await this.prisma.employee.update({
                where: { id },
                data,
                include: { department: true, jobTitle: true },
            });

            this.logger.log(`Employee updated: #${id}`);
            return updated;
        } catch (error: any) {
            if (error.code === 'P2002') {
                throw new ConflictException('Employee with this ID card already exists');
            }
            throw error;
        }
    }

    // ── Delete (soft-delete by default) ───────────────────────────────────

    async remove(id: number) {
        await this.findOne(id);

        // Soft-delete: set isActive = false instead of hard delete
        await this.prisma.employee.update({
            where: { id },
            data: { isActive: false },
        });

        this.logger.log(`Employee soft-deleted: #${id}`);
        return { message: `Employee #${id} deactivated successfully` };
    }
}
