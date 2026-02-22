import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { ShiftsService } from './shifts.service';
import { PrismaService } from '../prisma';

const mockPrisma = {
  shift: { create: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
  shiftAssignment: { create: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), delete: jest.fn() },
};

describe('ShiftsService', () => {
  let service: ShiftsService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShiftsService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get<ShiftsService>(ShiftsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => { expect(service).toBeDefined(); });

  describe('createShift', () => {
    it('should create a shift', async () => {
      mockPrisma.shift.create.mockResolvedValue({ id: 1, name: 'Morning' });
      const result = await service.createShift({ name: 'Morning', startTime: '08:00', endTime: '16:00' });
      expect(result.name).toBe('Morning');
    });

    it('should throw ConflictException on duplicate', async () => {
      mockPrisma.shift.create.mockRejectedValue(new Error('unique'));
      await expect(service.createShift({ name: 'Morning', startTime: '08:00', endTime: '16:00' })).rejects.toThrow(ConflictException);
    });
  });

  describe('assignShift', () => {
    it('should assign shift', async () => {
      mockPrisma.shiftAssignment.create.mockResolvedValue({ id: 1, shiftId: 1, employeeId: 1 });
      const result = await service.assignShift({ shiftId: 1, employeeId: 1, date: '2026-03-01' });
      expect(result.shiftId).toBe(1);
    });

    it('should throw on duplicate date', async () => {
      mockPrisma.shiftAssignment.create.mockRejectedValue(new Error('unique'));
      await expect(service.assignShift({ shiftId: 1, employeeId: 1, date: '2026-03-01' })).rejects.toThrow(ConflictException);
    });
  });

  describe('removeAssignment', () => {
    it('should throw NotFoundException', async () => {
      mockPrisma.shiftAssignment.findUnique.mockResolvedValue(null);
      await expect(service.removeAssignment(999)).rejects.toThrow(NotFoundException);
    });
  });
});
