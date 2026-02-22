import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { OrgChartService } from './org-chart.service';
import { PrismaService } from '../prisma';

const mockPrisma = {
  employee: { findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
};

describe('OrgChartService', () => {
  let service: OrgChartService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrgChartService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get<OrgChartService>(OrgChartService);
    jest.clearAllMocks();
  });

  it('should be defined', () => { expect(service).toBeDefined(); });

  describe('getTree', () => {
    it('should return org tree with roots', async () => {
      mockPrisma.employee.findMany.mockResolvedValue([
        { id: 1, firstName: 'Boss', lastName: 'A', managerId: null },
        { id: 2, firstName: 'Sub', lastName: 'B', managerId: 1 },
      ]);
      const result = await service.getTree();
      expect(result).toHaveLength(1);
      expect(result[0].subordinates).toHaveLength(1);
    });
  });

  describe('setManager', () => {
    it('should throw if employee not found', async () => {
      mockPrisma.employee.findUnique.mockResolvedValue(null);
      await expect(service.setManager(999, 1)).rejects.toThrow(NotFoundException);
    });

    it('should set manager', async () => {
      mockPrisma.employee.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.employee.update.mockResolvedValue({ id: 2, managerId: 1 });
      const result = await service.setManager(2, 1);
      expect(result.managerId).toBe(1);
    });
  });
});
