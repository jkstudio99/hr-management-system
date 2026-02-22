// ─────────────────────────────────────────────────────────────────────────────
// AssetsService — Company asset tracking (laptops, phones, badges, vehicles)
// ─────────────────────────────────────────────────────────────────────────────

import {
    Injectable,
    NotFoundException,
    ConflictException,
    Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma';
import { CreateAssetDto, UpdateAssetDto, QueryAssetDto } from './dto';

@Injectable()
export class AssetsService {
    private readonly logger = new Logger(AssetsService.name);

    constructor(private readonly prisma: PrismaService) { }

    async create(dto: CreateAssetDto) {
        try {
            const asset = await this.prisma.asset.create({
                data: dto,
                include: { employee: { select: { id: true, firstName: true, lastName: true } } },
            });
            this.logger.log(`Asset created: ${asset.assetName} (${asset.serialNumber})`);
            return asset;
        } catch (error: any) {
            if (error.code === 'P2002') throw new ConflictException('Serial number already exists');
            if (error.code === 'P2003') throw new NotFoundException('Employee not found');
            throw error;
        }
    }

    async findAll(query: QueryAssetDto) {
        const { page = 1, limit = 20, search, status, employeeId } = query;
        const skip = (page - 1) * limit;

        const where: Prisma.AssetWhereInput = {};
        if (search) {
            where.OR = [
                { assetName: { contains: search, mode: 'insensitive' } },
                { serialNumber: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (status) where.status = status;
        if (employeeId) where.employeeId = employeeId;

        const [data, total] = await Promise.all([
            this.prisma.asset.findMany({
                where,
                skip,
                take: limit,
                include: { employee: { select: { id: true, firstName: true, lastName: true } } },
                orderBy: { id: 'desc' },
            }),
            this.prisma.asset.count({ where }),
        ]);

        return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }

    async findOne(id: number) {
        const asset = await this.prisma.asset.findUnique({
            where: { id },
            include: { employee: { select: { id: true, firstName: true, lastName: true, department: true } } },
        });
        if (!asset) throw new NotFoundException(`Asset #${id} not found`);
        return asset;
    }

    async update(id: number, dto: UpdateAssetDto) {
        await this.findOne(id);
        try {
            return await this.prisma.asset.update({
                where: { id },
                data: dto,
                include: { employee: { select: { id: true, firstName: true, lastName: true } } },
            });
        } catch (error: any) {
            if (error.code === 'P2002') throw new ConflictException('Serial number already exists');
            throw error;
        }
    }

    async remove(id: number) {
        await this.findOne(id);
        await this.prisma.asset.delete({ where: { id } });
        return { message: `Asset #${id} deleted successfully` };
    }
}
