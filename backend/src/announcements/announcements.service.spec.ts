import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { PrismaService } from '../prisma';

const mockPrisma = {
  announcement: { create: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn(), delete: jest.fn(), count: jest.fn() },
};

describe('AnnouncementsService', () => {
  let service: AnnouncementsService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AnnouncementsService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get<AnnouncementsService>(AnnouncementsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => { expect(service).toBeDefined(); });

  describe('create', () => {
    it('should create announcement', async () => {
      mockPrisma.announcement.create.mockResolvedValue({ id: 1, title: 'News', isPinned: true });
      const result = await service.create({ title: 'News', content: 'Hello', isPinned: true }, 1);
      expect(result.isPinned).toBe(true);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException', async () => {
      mockPrisma.announcement.findUnique.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('archive', () => {
    it('should archive announcement', async () => {
      mockPrisma.announcement.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.announcement.update.mockResolvedValue({ id: 1, isArchived: true });
      const result = await service.archive(1);
      expect(result.isArchived).toBe(true);
    });
  });

  describe('remove', () => {
    it('should delete announcement', async () => {
      mockPrisma.announcement.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.announcement.delete.mockResolvedValue({});
      const result = await service.remove(1);
      expect(result.message).toContain('deleted');
    });
  });
});
