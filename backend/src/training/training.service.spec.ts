import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { TrainingService } from './training.service';
import { PrismaService } from '../prisma';

const mockPrisma = {
  trainingCourse: { create: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn(), delete: jest.fn(), count: jest.fn() },
  trainingEnrollment: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
};

describe('TrainingService', () => {
  let service: TrainingService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TrainingService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get<TrainingService>(TrainingService);
    jest.clearAllMocks();
  });

  it('should be defined', () => { expect(service).toBeDefined(); });

  describe('findOneCourse', () => {
    it('should throw NotFoundException', async () => {
      mockPrisma.trainingCourse.findUnique.mockResolvedValue(null);
      await expect(service.findOneCourse(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('enroll', () => {
    it('should reject inactive course', async () => {
      mockPrisma.trainingCourse.findUnique.mockResolvedValue({ id: 1, isActive: false, enrollments: [] });
      await expect(service.enroll(1, 1)).rejects.toThrow(BadRequestException);
    });

    it('should reject full course', async () => {
      mockPrisma.trainingCourse.findUnique.mockResolvedValue({ id: 1, isActive: true, maxCapacity: 1, enrollments: [{}] });
      await expect(service.enroll(1, 2)).rejects.toThrow(BadRequestException);
    });
  });
});
