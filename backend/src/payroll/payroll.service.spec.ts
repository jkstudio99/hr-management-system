// ─────────────────────────────────────────────────────────────────────────────
// PayrollService — Unit Tests
// ─────────────────────────────────────────────────────────────────────────────

import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PayrollService } from './payroll.service';
import { PrismaService } from '../prisma';

const mockRun = {
  id: 1,
  period: '2026-02',
  status: 'DRAFT',
  totalAmount: new Prisma.Decimal(0),
  processedBy: 1,
  items: [
    {
      id: 1,
      payrollRunId: 1,
      employeeId: 1,
      baseSalary: new Prisma.Decimal(50000),
      allowances: new Prisma.Decimal(0),
      deductions: new Prisma.Decimal(0),
      tax: new Prisma.Decimal(0),
      sso: new Prisma.Decimal(0),
      netPay: new Prisma.Decimal(50000),
      employee: { id: 1, firstName: 'John', lastName: 'Doe' },
    },
  ],
};

const mockPrisma = {
  payrollRun: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  payrollItem: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  employee: {
    findMany: jest.fn(),
  },
  $transaction: jest.fn(),
};

describe('PayrollService', () => {
  let service: PayrollService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayrollService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<PayrollService>(PayrollService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a payroll run with items', async () => {
      mockPrisma.payrollRun.findUnique.mockResolvedValue(null);
      mockPrisma.employee.findMany.mockResolvedValue([
        { id: 1, baseSalary: new Prisma.Decimal(50000) },
      ]);
      mockPrisma.payrollRun.create.mockResolvedValue(mockRun);

      const result = await service.create({ period: '2026-02' }, 1);
      expect(result.period).toBe('2026-02');
      expect(result.items).toHaveLength(1);
    });

    it('should throw ConflictException for duplicate period', async () => {
      mockPrisma.payrollRun.findUnique.mockResolvedValue(mockRun);

      await expect(
        service.create({ period: '2026-02' }, 1),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException if no active employees', async () => {
      mockPrisma.payrollRun.findUnique.mockResolvedValue(null);
      mockPrisma.employee.findMany.mockResolvedValue([]);

      await expect(
        service.create({ period: '2026-03' }, 1),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should return a payroll run with items', async () => {
      mockPrisma.payrollRun.findUnique.mockResolvedValue(mockRun);
      const result = await service.findOne(1);
      expect(result.id).toBe(1);
    });

    it('should throw NotFoundException', async () => {
      mockPrisma.payrollRun.findUnique.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateItem', () => {
    it('should update allowances on a DRAFT item', async () => {
      mockPrisma.payrollItem.findUnique.mockResolvedValue({
        id: 1,
        allowances: new Prisma.Decimal(0),
        deductions: new Prisma.Decimal(0),
        payrollRun: { status: 'DRAFT' },
      });
      mockPrisma.payrollItem.update.mockResolvedValue({
        id: 1,
        allowances: new Prisma.Decimal(5000),
      });

      const result = await service.updateItem(1, { allowances: 5000 });
      expect(result.allowances).toEqual(new Prisma.Decimal(5000));
    });

    it('should reject updates on COMPLETED runs', async () => {
      mockPrisma.payrollItem.findUnique.mockResolvedValue({
        id: 1,
        payrollRun: { status: 'COMPLETED' },
      });

      await expect(
        service.updateItem(1, { allowances: 5000 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('process', () => {
    it('should reject processing non-DRAFT runs', async () => {
      mockPrisma.payrollRun.findUnique.mockResolvedValue({
        ...mockRun,
        status: 'COMPLETED',
      });

      await expect(service.process(1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('complete', () => {
    it('should reject completing non-PROCESSING runs', async () => {
      mockPrisma.payrollRun.findUnique.mockResolvedValue({
        ...mockRun,
        status: 'DRAFT',
      });

      await expect(service.complete(1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should delete a DRAFT run', async () => {
      mockPrisma.payrollRun.findUnique.mockResolvedValue(mockRun);
      mockPrisma.payrollRun.delete.mockResolvedValue(mockRun);

      const result = await service.remove(1);
      expect(result.message).toContain('deleted');
    });

    it('should reject deleting non-DRAFT runs', async () => {
      mockPrisma.payrollRun.findUnique.mockResolvedValue({
        ...mockRun,
        status: 'PROCESSING',
      });

      await expect(service.remove(1)).rejects.toThrow(BadRequestException);
    });
  });
});
