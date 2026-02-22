// ─────────────────────────────────────────────────────────────────────────────
// TwoFactorService — Unit Tests
// ─────────────────────────────────────────────────────────────────────────────

import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { TwoFactorService } from './two-factor.service';
import { PrismaService } from '../prisma';

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

// Mock otplib
jest.mock('otplib', () => ({
  generateSecret: jest.fn().mockReturnValue('MOCKSECRET123456'),
  generateURI: jest.fn().mockReturnValue('otpauth://totp/HR:admin?secret=MOCKSECRET123456'),
  verify: jest.fn().mockResolvedValue(true),
}));

// Mock qrcode
jest.mock('qrcode', () => ({
  toDataURL: jest.fn().mockResolvedValue('data:image/png;base64,mockqr'),
}));

describe('TwoFactorService', () => {
  let service: TwoFactorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TwoFactorService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<TwoFactorService>(TwoFactorService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('setup', () => {
    it('should generate secret and QR code', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 1,
        username: 'admin',
        isTwoFactorEnabled: false,
      });
      mockPrisma.user.update.mockResolvedValue({});

      const result = await service.setup(1);

      expect(result).toHaveProperty('secret');
      expect(result).toHaveProperty('qrCodeDataUrl');
      expect(result).toHaveProperty('otpauthUrl');
      expect(mockPrisma.user.update).toHaveBeenCalled();
    });

    it('should throw if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.setup(999)).rejects.toThrow(BadRequestException);
    });

    it('should throw if 2FA already enabled', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 1,
        username: 'admin',
        isTwoFactorEnabled: true,
      });

      await expect(service.setup(1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('verify', () => {
    it('should enable 2FA with valid code', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 1,
        twoFactorSecret: 'MOCKSECRET',
        isTwoFactorEnabled: false,
      });
      mockPrisma.user.update.mockResolvedValue({});

      const result = await service.verify(1, '123456');
      expect(result.message).toContain('enabled');
    });

    it('should throw if no secret set up', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 1,
        twoFactorSecret: null,
        isTwoFactorEnabled: false,
      });

      await expect(service.verify(1, '123456')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw if 2FA already enabled', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 1,
        twoFactorSecret: 'MOCKSECRET',
        isTwoFactorEnabled: true,
      });

      await expect(service.verify(1, '123456')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('validateCode', () => {
    it('should return true if 2FA not enabled', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        isTwoFactorEnabled: false,
        twoFactorSecret: null,
      });

      const result = await service.validateCode(1, '123456');
      expect(result).toBe(true);
    });
  });

  describe('disable', () => {
    it('should throw if 2FA not enabled', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 1,
        twoFactorSecret: null,
        isTwoFactorEnabled: false,
      });

      await expect(service.disable(1, '123456')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getStatus', () => {
    it('should return 2FA status', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        isTwoFactorEnabled: true,
      });

      const result = await service.getStatus(1);
      expect(result.isTwoFactorEnabled).toBe(true);
    });

    it('should return false if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await service.getStatus(999);
      expect(result.isTwoFactorEnabled).toBe(false);
    });
  });
});
