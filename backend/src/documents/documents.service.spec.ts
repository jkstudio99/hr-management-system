import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { PrismaService } from '../prisma';

const mockPrisma = {
  document: { create: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn(), delete: jest.fn(), count: jest.fn() },
};

describe('DocumentsService', () => {
  let service: DocumentsService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DocumentsService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get<DocumentsService>(DocumentsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => { expect(service).toBeDefined(); });

  describe('create', () => {
    it('should create a document', async () => {
      mockPrisma.document.create.mockResolvedValue({ id: 1, title: 'Contract', category: 'CONTRACT' });
      const result = await service.create({ title: 'Contract', category: 'CONTRACT', fileUrl: '/files/c.pdf' });
      expect(result.title).toBe('Contract');
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException', async () => {
      mockPrisma.document.findUnique.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return paginated results', async () => {
      mockPrisma.document.findMany.mockResolvedValue([]);
      mockPrisma.document.count.mockResolvedValue(0);
      const result = await service.findAll({ page: 1, limit: 20 });
      expect(result.meta.total).toBe(0);
    });
  });

  describe('remove', () => {
    it('should delete document', async () => {
      mockPrisma.document.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.document.delete.mockResolvedValue({});
      const result = await service.remove(1);
      expect(result.message).toContain('deleted');
    });
  });
});
