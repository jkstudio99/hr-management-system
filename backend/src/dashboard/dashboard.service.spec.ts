// ─────────────────────────────────────────────────────────────────────────────
// DashboardService — Unit Tests
// ─────────────────────────────────────────────────────────────────────────────

import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../prisma';

const mockPrisma = {
  employee: {
    count: jest.fn(),
    groupBy: jest.fn(),
  },
  department: {
    count: jest.fn(),
    findMany: jest.fn(),
  },
  leaveRequest: {
    count: jest.fn(),
    groupBy: jest.fn(),
  },
  expenseClaim: { count: jest.fn() },
  asset: { count: jest.fn() },
};

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getStats', () => {
    it('should return aggregated dashboard stats', async () => {
      mockPrisma.employee.count
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(90)  // active
        .mockResolvedValueOnce(10); // inactive
      mockPrisma.department.count.mockResolvedValue(5);
      mockPrisma.leaveRequest.count.mockResolvedValue(3);
      mockPrisma.expenseClaim.count.mockResolvedValue(2);
      mockPrisma.asset.count
        .mockResolvedValueOnce(50)  // total
        .mockResolvedValueOnce(30); // assigned

      const result = await service.getStats();

      expect(result.headcount.total).toBe(100);
      expect(result.headcount.active).toBe(90);
      expect(result.headcount.turnoverRate).toBe(10);
      expect(result.departments).toBe(5);
      expect(result.pendingApprovals.leaveRequests).toBe(3);
      expect(result.assets.total).toBe(50);
      expect(result.assets.available).toBe(20);
    });

    it('should handle zero employees gracefully', async () => {
      mockPrisma.employee.count.mockResolvedValue(0);
      mockPrisma.department.count.mockResolvedValue(0);
      mockPrisma.leaveRequest.count.mockResolvedValue(0);
      mockPrisma.expenseClaim.count.mockResolvedValue(0);
      mockPrisma.asset.count.mockResolvedValue(0);

      const result = await service.getStats();
      expect(result.headcount.turnoverRate).toBe(0);
    });
  });

  describe('getDepartmentStats', () => {
    it('should return department headcount breakdown', async () => {
      mockPrisma.department.findMany.mockResolvedValue([
        { id: 1, departmentName: 'Engineering', _count: { employees: 25 } },
        { id: 2, departmentName: 'HR', _count: { employees: 10 } },
      ]);

      const result = await service.getDepartmentStats();
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Engineering');
      expect(result[0].headcount).toBe(25);
    });
  });

  describe('getLeaveStats', () => {
    it('should return leave statistics grouped by status', async () => {
      mockPrisma.leaveRequest.groupBy.mockResolvedValue([
        { status: 'PENDING', _count: 5 },
        { status: 'APPROVED', _count: 20 },
        { status: 'REJECTED', _count: 3 },
      ]);

      const result = await service.getLeaveStats();
      expect(result).toHaveLength(3);
      expect(result[0].status).toBe('PENDING');
    });
  });
});
