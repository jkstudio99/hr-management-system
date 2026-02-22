// ─────────────────────────────────────────────────────────────────────────────
// EssService — Unit Tests
// ─────────────────────────────────────────────────────────────────────────────

import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, BadRequestException } from '@nestjs/common';
import { EssService } from './ess.service';
import { PrismaService } from '../prisma';

const mockUser = { id: 1, employeeId: 1 };
const mockEmployee = {
  id: 1,
  idCard: '1234567890123',
  firstName: 'John',
  lastName: 'Doe',
  baseSalary: 50000,
  isActive: true,
  department: { id: 1, departmentName: 'Engineering' },
  jobTitle: { id: 1, titleName: 'Developer' },
  user: { id: 1, username: 'john', email: 'john@test.com' },
};

const mockPrisma = {
  user: { findUnique: jest.fn() },
  employee: { findUnique: jest.fn() },
  leaveRequest: {
    findMany: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
  },
  asset: { findMany: jest.fn() },
  expenseClaim: {
    findMany: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
  },
  performanceReview: { findMany: jest.fn() },
  payrollItem: { findMany: jest.fn() },
};

describe('EssService', () => {
  let service: EssService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EssService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<EssService>(EssService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMyProfile', () => {
    it('should return employee profile without baseSalary', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.employee.findUnique.mockResolvedValue(mockEmployee);

      const result = await service.getMyProfile(1);
      expect(result.firstName).toBe('John');
      expect(result).not.toHaveProperty('baseSalary');
    });

    it('should throw ForbiddenException if user has no employeeId', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 2, employeeId: null });

      await expect(service.getMyProfile(2)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getMyLeaves', () => {
    it('should return paginated leave requests', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.leaveRequest.findMany.mockResolvedValue([]);
      mockPrisma.leaveRequest.count.mockResolvedValue(0);

      const result = await service.getMyLeaves(1);
      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
    });
  });

  describe('submitLeave', () => {
    it('should create a leave request', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.leaveRequest.create.mockResolvedValue({
        id: 1,
        employeeId: 1,
        leaveType: 'ANNUAL',
        startDate: new Date('2026-03-01'),
        endDate: new Date('2026-03-05'),
        status: 'PENDING',
      });

      const result = await service.submitLeave(1, {
        leaveType: 'ANNUAL',
        startDate: '2026-03-01',
        endDate: '2026-03-05',
      });
      expect(result.leaveType).toBe('ANNUAL');
    });

    it('should reject if endDate < startDate', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.submitLeave(1, {
          leaveType: 'ANNUAL',
          startDate: '2026-03-05',
          endDate: '2026-03-01',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getMyAssets', () => {
    it('should return assigned assets', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.asset.findMany.mockResolvedValue([
        { id: 1, assetName: 'MacBook', serialNumber: 'SN001', status: 'ASSIGNED' },
      ]);

      const result = await service.getMyAssets(1);
      expect(result).toHaveLength(1);
    });
  });

  describe('submitExpenseClaim', () => {
    it('should reject zero or negative amount', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.submitExpenseClaim(1, { claimType: 'MEDICAL', amount: 0 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getMyReviews', () => {
    it('should return performance reviews', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.performanceReview.findMany.mockResolvedValue([]);

      const result = await service.getMyReviews(1);
      expect(result).toEqual([]);
    });
  });

  describe('getMyPayslips', () => {
    it('should return payroll items', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.payrollItem.findMany.mockResolvedValue([]);

      const result = await service.getMyPayslips(1);
      expect(result).toEqual([]);
    });
  });
});
