import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { OvertimeService } from './overtime.service';
import { PrismaService } from '../prisma';

const mockPrisma = {
  employee: { findUnique: jest.fn() },
  overtimeRequest: { create: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn(), count: jest.fn() },
  timesheetEntry: { findUnique: jest.fn(), upsert: jest.fn(), update: jest.fn(), findMany: jest.fn() },
};

describe('OvertimeService', () => {
  let service: OvertimeService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OvertimeService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get<OvertimeService>(OvertimeService);
    jest.clearAllMocks();
  });

  it('should be defined', () => { expect(service).toBeDefined(); });

  describe('createOtRequest', () => {
    it('should create OT request', async () => {
      mockPrisma.employee.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.overtimeRequest.create.mockResolvedValue({ id: 1, status: 'PENDING', hours: new Prisma.Decimal(3) });
      const result = await service.createOtRequest({ employeeId: 1, date: '2026-03-01', hours: 3 });
      expect(result.status).toBe('PENDING');
    });

    it('should throw if employee not found', async () => {
      mockPrisma.employee.findUnique.mockResolvedValue(null);
      await expect(service.createOtRequest({ employeeId: 999, date: '2026-03-01', hours: 3 })).rejects.toThrow(NotFoundException);
    });
  });

  describe('approveOt', () => {
    it('should approve PENDING OT', async () => {
      mockPrisma.overtimeRequest.findUnique.mockResolvedValue({ id: 1, status: 'PENDING' });
      mockPrisma.overtimeRequest.update.mockResolvedValue({ id: 1, status: 'APPROVED' });
      const result = await service.approveOt(1, 1);
      expect(result.status).toBe('APPROVED');
    });

    it('should reject non-PENDING', async () => {
      mockPrisma.overtimeRequest.findUnique.mockResolvedValue({ id: 1, status: 'APPROVED' });
      await expect(service.approveOt(1, 1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('clockIn', () => {
    it('should reject if already clocked in', async () => {
      mockPrisma.timesheetEntry.findUnique.mockResolvedValue({ clockIn: new Date() });
      await expect(service.clockIn(1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('clockOut', () => {
    it('should reject if not clocked in', async () => {
      mockPrisma.timesheetEntry.findUnique.mockResolvedValue(null);
      await expect(service.clockOut(1)).rejects.toThrow(BadRequestException);
    });
  });
});
