// ─────────────────────────────────────────────────────────────────────────────
// SurveysService — Unit Tests
// ─────────────────────────────────────────────────────────────────────────────

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { SurveysService } from './surveys.service';
import { PrismaService } from '../prisma';

const now = new Date();
const future = new Date(now.getTime() + 86400000 * 30);

const mockSurvey = {
  id: 1,
  title: 'Q1 Pulse',
  isActive: true,
  startDate: now,
  endDate: future,
  questions: [
    { id: 1, surveyId: 1, question: 'How happy?', type: 'RATING', sortOrder: 0, responses: [] },
  ],
  createdAt: now,
};

const mockPrisma = {
  survey: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  surveyResponse: { create: jest.fn() },
  $transaction: jest.fn(),
};

describe('SurveysService', () => {
  let service: SurveysService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SurveysService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<SurveysService>(SurveysService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a survey with questions', async () => {
      mockPrisma.survey.create.mockResolvedValue(mockSurvey);

      const result = await service.create({
        title: 'Q1 Pulse',
        startDate: now.toISOString(),
        endDate: future.toISOString(),
        questions: [{ question: 'How happy?', type: 'RATING' }],
      });

      expect(result.title).toBe('Q1 Pulse');
      expect(mockPrisma.survey.create).toHaveBeenCalled();
    });

    it('should reject if endDate <= startDate', async () => {
      await expect(
        service.create({
          title: 'Bad',
          startDate: future.toISOString(),
          endDate: now.toISOString(),
          questions: [{ question: 'Q?' }],
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return paginated surveys', async () => {
      mockPrisma.survey.findMany.mockResolvedValue([mockSurvey]);
      mockPrisma.survey.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 20 });
      expect(result.data).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return a survey', async () => {
      mockPrisma.survey.findUnique.mockResolvedValue(mockSurvey);
      const result = await service.findOne(1);
      expect(result.id).toBe(1);
    });

    it('should throw NotFoundException', async () => {
      mockPrisma.survey.findUnique.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('submitResponses', () => {
    it('should reject if survey is inactive', async () => {
      mockPrisma.survey.findUnique.mockResolvedValue({
        ...mockSurvey,
        isActive: false,
      });

      await expect(
        service.submitResponses(1, { answers: [{ questionId: 1, answer: '5' }] }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject if questionId does not belong to survey', async () => {
      mockPrisma.survey.findUnique.mockResolvedValue(mockSurvey);

      await expect(
        service.submitResponses(1, { answers: [{ questionId: 999, answer: '5' }] }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should delete a survey', async () => {
      mockPrisma.survey.findUnique.mockResolvedValue(mockSurvey);
      mockPrisma.survey.delete.mockResolvedValue(mockSurvey);

      const result = await service.remove(1);
      expect(result.message).toContain('deleted');
    });
  });
});
