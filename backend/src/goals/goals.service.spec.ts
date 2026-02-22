import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GoalsService } from './goals.service';
import { PrismaService } from '../prisma';

const mockPrisma = {
  goal: { create: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn(), delete: jest.fn(), count: jest.fn() },
  keyResult: { findUnique: jest.fn(), update: jest.fn() },
};

describe('GoalsService', () => {
  let service: GoalsService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GoalsService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get<GoalsService>(GoalsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => { expect(service).toBeDefined(); });

  describe('create', () => {
    it('should create goal with key results', async () => {
      mockPrisma.goal.create.mockResolvedValue({ id: 1, title: 'Test', keyResults: [{ id: 1, title: 'KR1' }] });
      const result = await service.create({ employeeId: 1, title: 'Test', period: '2026-Q1', keyResults: [{ title: 'KR1', targetValue: 100 }] });
      expect(result.keyResults).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException', async () => {
      mockPrisma.goal.findUnique.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateKeyResult', () => {
    it('should throw if KR not found', async () => {
      mockPrisma.keyResult.findUnique.mockResolvedValue(null);
      await expect(service.updateKeyResult(999, { currentValue: 50 })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete goal', async () => {
      mockPrisma.goal.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.goal.delete.mockResolvedValue({});
      const result = await service.remove(1);
      expect(result.message).toContain('deleted');
    });
  });
});
