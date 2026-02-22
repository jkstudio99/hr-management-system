// ─────────────────────────────────────────────────────────────────────────────
// LeaveRequestsService — Leave / absence management logic
// ─────────────────────────────────────────────────────────────────────────────
// Business rules:
//   • Employees can create leave requests for themselves
//   • Admin/HR can approve or reject leave requests
//   • Date validation: endDate must be >= startDate
//   • Status transitions: PENDING → APPROVED | REJECTED
// ─────────────────────────────────────────────────────────────────────────────

import {
    Injectable,
    NotFoundException,
    BadRequestException,
    Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma';
import {
    CreateLeaveRequestDto,
    UpdateLeaveRequestDto,
    QueryLeaveRequestDto,
} from './dto';

@Injectable()
export class LeaveRequestsService {
    private readonly logger = new Logger(LeaveRequestsService.name);

    constructor(private readonly prisma: PrismaService) { }

    async create(dto: CreateLeaveRequestDto) {
        // ── Date validation ─────────────────────────────────────────────────
        const startDate = new Date(dto.startDate);
        const endDate = new Date(dto.endDate);

        if (endDate < startDate) {
            throw new BadRequestException('End date must be after start date');
        }

        // ── Verify employee exists ──────────────────────────────────────────
        const employee = await this.prisma.employee.findUnique({
            where: { id: dto.employeeId },
        });

        if (!employee) {
            throw new NotFoundException(`Employee #${dto.employeeId} not found`);
        }

        const leaveRequest = await this.prisma.leaveRequest.create({
            data: {
                employeeId: dto.employeeId,
                leaveType: dto.leaveType,
                startDate,
                endDate,
            },
            include: {
                employee: {
                    select: { id: true, firstName: true, lastName: true, department: true },
                },
            },
        });

        this.logger.log(
            `Leave request created: #${leaveRequest.id} for Employee #${dto.employeeId}`,
        );
        return leaveRequest;
    }

    async findAll(query: QueryLeaveRequestDto) {
        const { page = 1, limit = 20, employeeId, status, leaveType } = query;
        const skip = (page - 1) * limit;

        const where: Prisma.LeaveRequestWhereInput = {};

        if (employeeId) where.employeeId = employeeId;
        if (status) where.status = status;
        if (leaveType) where.leaveType = leaveType;

        const [data, total] = await Promise.all([
            this.prisma.leaveRequest.findMany({
                where,
                skip,
                take: limit,
                include: {
                    employee: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            department: true,
                        },
                    },
                },
                orderBy: { startDate: 'desc' },
            }),
            this.prisma.leaveRequest.count({ where }),
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

    async findOne(id: number) {
        const leaveRequest = await this.prisma.leaveRequest.findUnique({
            where: { id },
            include: {
                employee: {
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

        if (!leaveRequest) {
            throw new NotFoundException(`Leave request #${id} not found`);
        }

        return leaveRequest;
    }

    async update(id: number, dto: UpdateLeaveRequestDto) {
        const existing = await this.findOne(id);

        // ── Prevent updating already-decided requests ───────────────────────
        if (
            existing.status !== 'PENDING' &&
            dto.status &&
            dto.status !== existing.status
        ) {
            throw new BadRequestException(
                `Cannot change status of a ${existing.status} leave request`,
            );
        }

        const data: any = { ...dto };
        if (dto.startDate) data.startDate = new Date(dto.startDate);
        if (dto.endDate) data.endDate = new Date(dto.endDate);

        const updated = await this.prisma.leaveRequest.update({
            where: { id },
            data,
            include: {
                employee: {
                    select: { id: true, firstName: true, lastName: true },
                },
            },
        });

        this.logger.log(`Leave request updated: #${id} → ${updated.status}`);
        return updated;
    }

    async remove(id: number) {
        await this.findOne(id);
        await this.prisma.leaveRequest.delete({ where: { id } });
        this.logger.log(`Leave request deleted: #${id}`);
        return { message: `Leave request #${id} deleted successfully` };
    }
}
