// ─────────────────────────────────────────────────────────────────────────────
// ExpenseClaimsService — Unit Tests
// ─────────────────────────────────────────────────────────────────────────────

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ExpenseClaimsService } from './expense-claims.service';
import { PrismaService } from '../prisma';

const mockEmployee = {
  id: 1,
  firstName: 'John',
  lastName: 'Doe',
  department: { departmentName: 'Engineering' },
};
const mockClaim = {
  id: 1,
  employeeId: 1,
  claimType: 'MEDICAL',
  amount: 5000,
  receiptUrl: null,
  status: 'PENDING',
  employee: mockEmployee,
};

const mockPrisma = {
  employee: { findUnique: jest.fn() },
  expenseClaim: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
};

describe('ExpenseClaimsService', () => {
  let service: ExpenseClaimsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpenseClaimsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ExpenseClaimsService>(ExpenseClaimsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an expense claim', async () => {
      mockPrisma.employee.findUnique.mockResolvedValue(mockEmployee);
      mockPrisma.expenseClaim.create.mockResolvedValue(mockClaim);

      const result = await service.create({
        employeeId: 1,
        claimType: 'MEDICAL',
        amount: 5000,
      });

      expect(result).toEqual(mockClaim);
      expect(mockPrisma.employee.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException for non-existent employee', async () => {
      mockPrisma.employee.findUnique.mockResolvedValue(null);

      await expect(
        service.create({ employeeId: 999, claimType: 'MEDICAL', amount: 5000 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return paginated claims', async () => {
      mockPrisma.expenseClaim.findMany.mockResolvedValue([mockClaim]);
      mockPrisma.expenseClaim.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('should filter by status', async () => {
      mockPrisma.expenseClaim.findMany.mockResolvedValue([]);
      mockPrisma.expenseClaim.count.mockResolvedValue(0);

      await service.findAll({ status: 'APPROVED' });

      expect(mockPrisma.expenseClaim.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'APPROVED' }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a claim by id', async () => {
      mockPrisma.expenseClaim.findUnique.mockResolvedValue(mockClaim);
      const result = await service.findOne(1);
      expect(result.id).toBe(1);
    });

    it('should throw NotFoundException', async () => {
      mockPrisma.expenseClaim.findUnique.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should approve a PENDING claim', async () => {
      mockPrisma.expenseClaim.findUnique.mockResolvedValue(mockClaim);
      mockPrisma.expenseClaim.update.mockResolvedValue({
        ...mockClaim,
        status: 'APPROVED',
      });

      const result = await service.update(1, { status: 'APPROVED' });
      expect(result.status).toBe('APPROVED');
    });

    it('should reject changing status of already-decided claim', async () => {
      mockPrisma.expenseClaim.findUnique.mockResolvedValue({
        ...mockClaim,
        status: 'APPROVED',
      });

      await expect(service.update(1, { status: 'REJECTED' })).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a claim', async () => {
      mockPrisma.expenseClaim.findUnique.mockResolvedValue(mockClaim);
      mockPrisma.expenseClaim.delete.mockResolvedValue(mockClaim);

      const result = await service.remove(1);
      expect(result.message).toContain('deleted');
    });
  });
});
