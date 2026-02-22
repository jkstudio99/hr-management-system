import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { RecruitmentService } from './recruitment.service';
import { PrismaService } from '../prisma';

const mockPrisma = {
  jobPosting: { create: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn(), delete: jest.fn(), count: jest.fn() },
  applicant: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
};

describe('RecruitmentService', () => {
  let service: RecruitmentService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecruitmentService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get<RecruitmentService>(RecruitmentService);
    jest.clearAllMocks();
  });

  it('should be defined', () => { expect(service).toBeDefined(); });

  describe('createPosting', () => {
    it('should create a job posting', async () => {
      mockPrisma.jobPosting.create.mockResolvedValue({ id: 1, title: 'Dev', status: 'OPEN' });
      const result = await service.createPosting({ title: 'Dev', description: 'Build stuff' });
      expect(result.status).toBe('OPEN');
    });
  });

  describe('findOnePosting', () => {
    it('should throw NotFoundException', async () => {
      mockPrisma.jobPosting.findUnique.mockResolvedValue(null);
      await expect(service.findOnePosting(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateApplicantStage', () => {
    it('should reject invalid stage', async () => {
      await expect(service.updateApplicantStage(1, 'INVALID')).rejects.toThrow(BadRequestException);
    });

    it('should update stage', async () => {
      mockPrisma.applicant.findUnique.mockResolvedValue({ id: 1, stage: 'APPLIED' });
      mockPrisma.applicant.update.mockResolvedValue({ id: 1, stage: 'INTERVIEW' });
      const result = await service.updateApplicantStage(1, 'INTERVIEW');
      expect(result.stage).toBe('INTERVIEW');
    });
  });
});
