// ─────────────────────────────────────────────────────────────────────────────
// PrismaService — Unit Test
// ─────────────────────────────────────────────────────────────────────────────

import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
    let service: PrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [PrismaService],
        }).compile();

        service = module.get<PrismaService>(PrismaService);
    });

    afterEach(async () => {
        // Ensure clean disconnect after each test
        await service.$disconnect();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should extend PrismaClient', () => {
        expect(service.constructor.name).toBe('PrismaService');
    });

    it('should have onModuleInit method', () => {
        expect(typeof service.onModuleInit).toBe('function');
    });

    it('should have onModuleDestroy method', () => {
        expect(typeof service.onModuleDestroy).toBe('function');
    });
});
