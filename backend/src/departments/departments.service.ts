// ─────────────────────────────────────────────────────────────────────────────
// DepartmentsService — Business logic for organizational departments
// ─────────────────────────────────────────────────────────────────────────────

import {
    Injectable,
    NotFoundException,
    ConflictException,
    Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto';

@Injectable()
export class DepartmentsService {
    private readonly logger = new Logger(DepartmentsService.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Create a new department.
     * @throws ConflictException if name already exists
     */
    async create(dto: CreateDepartmentDto) {
        try {
            const department = await this.prisma.department.create({ data: dto });
            this.logger.log(`Department created: ${department.departmentName}`);
            return department;
        } catch (error: any) {
            if (error.code === 'P2002') {
                throw new ConflictException('Department name already exists');
            }
            throw error;
        }
    }

    /** List all departments with employee count. */
    async findAll() {
        return this.prisma.department.findMany({
            include: { _count: { select: { employees: true } } },
            orderBy: { departmentName: 'asc' },
        });
    }

    /**
     * Get a single department with its employees.
     * @throws NotFoundException if ID doesn't exist
     */
    async findOne(id: number) {
        const department = await this.prisma.department.findUnique({
            where: { id },
            include: {
                employees: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        jobTitle: true,
                        isActive: true,
                    },
                },
            },
        });

        if (!department) {
            throw new NotFoundException(`Department #${id} not found`);
        }

        return department;
    }

    /**
     * Update department by ID.
     * @throws NotFoundException if ID doesn't exist
     */
    async update(id: number, dto: UpdateDepartmentDto) {
        await this.findOne(id); // ensure exists

        try {
            const updated = await this.prisma.department.update({
                where: { id },
                data: dto,
            });
            this.logger.log(`Department updated: #${id}`);
            return updated;
        } catch (error: any) {
            if (error.code === 'P2002') {
                throw new ConflictException('Department name already exists');
            }
            throw error;
        }
    }

    /**
     * Delete department by ID.
     * @throws NotFoundException if ID doesn't exist
     */
    async remove(id: number) {
        await this.findOne(id); // ensure exists

        await this.prisma.department.delete({ where: { id } });
        this.logger.log(`Department deleted: #${id}`);
        return { message: `Department #${id} deleted successfully` };
    }
}
