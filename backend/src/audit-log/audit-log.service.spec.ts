import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogService } from './audit-log.service';
import { PrismaService } from '../prisma';

const mockPrisma = {
  auditLog: {
    create: jest.fn().mockResolvedValue({ id: 1, action: 'CREATE', entity: 'Employee', entityId: 1 }),
    findMany: jest.fn().mockResolvedValue([]),
    count: jest.fn().mockResolvedValue(0),
  },
};

describe('AuditLogService', () => {
  let service: AuditLogService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuditLogService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get<AuditLogService>(AuditLogService);
    jest.clearAllMocks();
  });

  it('should be defined', () => { expect(service).toBeDefined(); });

  it('should log an audit entry', async () => {
    const result = await service.log({ action: 'CREATE', entity: 'Employee', entityId: 1 });
    expect(result.action).toBe('CREATE');
    expect(mockPrisma.auditLog.create).toHaveBeenCalled();
  });

  it('should return paginated audit logs', async () => {
    const result = await service.findAll({ page: 1, limit: 50 });
    expect(result.data).toEqual([]);
    expect(result.meta.total).toBe(0);
  });

  it('should filter by entity', async () => {
    await service.findAll({ entity: 'Employee' });
    expect(mockPrisma.auditLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ entity: 'Employee' }) }),
    );
  });
});
