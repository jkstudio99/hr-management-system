import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { BenefitsService } from './benefits.service';
import { PrismaService } from '../prisma';

const mockPrisma = {
  benefitPlan: { create: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn(), delete: jest.fn(), count: jest.fn() },
  employeeBenefit: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
};

describe('BenefitsService', () => {
  let service: BenefitsService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BenefitsService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get<BenefitsService>(BenefitsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => { expect(service).toBeDefined(); });

  describe('createPlan', () => {
    it('should create a benefit plan', async () => {
      mockPrisma.benefitPlan.create.mockResolvedValue({ id: 1, name: 'Health', type: 'HEALTH' });
      const result = await service.createPlan({ name: 'Health', type: 'HEALTH' });
      expect(result.name).toBe('Health');
    });

    it('should throw ConflictException on duplicate', async () => {
      mockPrisma.benefitPlan.create.mockRejectedValue(new Error('unique'));
      await expect(service.createPlan({ name: 'Health', type: 'HEALTH' })).rejects.toThrow(ConflictException);
    });
  });

  describe('findOnePlan', () => {
    it('should throw NotFoundException', async () => {
      mockPrisma.benefitPlan.findUnique.mockResolvedValue(null);
      await expect(service.findOnePlan(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('unenroll', () => {
    it('should throw if enrollment not found', async () => {
      mockPrisma.employeeBenefit.findUnique.mockResolvedValue(null);
      await expect(service.unenroll(999)).rejects.toThrow(NotFoundException);
    });

    it('should deactivate enrollment', async () => {
      mockPrisma.employeeBenefit.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.employeeBenefit.update.mockResolvedValue({ id: 1, isActive: false });
      const result = await service.unenroll(1);
      expect(result.isActive).toBe(false);
    });
  });
});
