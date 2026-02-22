// ─────────────────────────────────────────────────────────────────────────────
// AuthService — Unit Tests
// ─────────────────────────────────────────────────────────────────────────────
// Tests cover:
//   • Successful login with correct credentials
//   • Login failure with wrong password
//   • Login failure with non-existent user
//   • Successful registration
//   • Registration conflict (duplicate username)
//   • Profile retrieval
// ─────────────────────────────────────────────────────────────────────────────

import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma';

// ── Mock Data ───────────────────────────────────────────────────────────────

const mockRole = { id: 1, roleName: 'ADMIN' };
const mockEmployeeRole = { id: 3, roleName: 'EMPLOYEE' };
const mockPasswordHash = bcrypt.hashSync('password', 10);

const mockUser = {
    id: 1,
    username: 'admin',
    email: 'admin@hrms.local',
    passwordHash: mockPasswordHash,
    isActive: true,
    roleId: 1,
    role: mockRole,
    createdAt: new Date(),
    updatedAt: new Date(),
};

// ── Mock Providers ──────────────────────────────────────────────────────────

const mockPrismaService = {
    user: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
    },
    role: {
        findUnique: jest.fn(),
    },
};

const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-jwt-token'),
};

// ── Test Suite ──────────────────────────────────────────────────────────────

describe('AuthService', () => {
    let service: AuthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: JwtService, useValue: mockJwtService },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);

        // Reset all mocks between tests
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    // ── Login Tests ─────────────────────────────────────────────────────────

    describe('login', () => {
        it('should return user and token for valid credentials', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

            const result = await service.login({
                username: 'admin',
                password: 'password',
            });

            expect(result).toHaveProperty('accessToken');
            expect(result).toHaveProperty('user');
            expect(result.user).not.toHaveProperty('passwordHash');
            expect(result.user.username).toBe('admin');
        });

        it('should throw UnauthorizedException for wrong password', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

            await expect(
                service.login({ username: 'admin', password: 'wrong-password' }),
            ).rejects.toThrow(UnauthorizedException);
        });

        it('should throw UnauthorizedException for non-existent user', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(null);

            await expect(
                service.login({ username: 'nobody', password: 'password' }),
            ).rejects.toThrow(UnauthorizedException);
        });

        it('should throw UnauthorizedException for deactivated user', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue({
                ...mockUser,
                isActive: false,
            });

            await expect(
                service.login({ username: 'admin', password: 'password' }),
            ).rejects.toThrow(UnauthorizedException);
        });
    });

    // ── Register Tests ──────────────────────────────────────────────────────

    describe('register', () => {
        it('should create user and return token', async () => {
            mockPrismaService.user.findFirst.mockResolvedValue(null);
            mockPrismaService.role.findUnique.mockResolvedValue(mockEmployeeRole);
            mockPrismaService.user.create.mockResolvedValue({
                ...mockUser,
                username: 'newuser',
                email: 'new@test.com',
                role: mockEmployeeRole,
            });

            const result = await service.register({
                username: 'newuser',
                password: 'securePass123',
                email: 'new@test.com',
            });

            expect(result).toHaveProperty('accessToken');
            expect(result.user).not.toHaveProperty('passwordHash');
        });

        it('should throw ConflictException for duplicate username', async () => {
            mockPrismaService.user.findFirst.mockResolvedValue(mockUser);

            await expect(
                service.register({
                    username: 'admin',
                    password: 'securePass123',
                    email: 'other@test.com',
                }),
            ).rejects.toThrow(ConflictException);
        });
    });

    // ── Profile Tests ────────────────────────────────────────────────────────

    describe('getProfile', () => {
        it('should return sanitized user profile', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

            const result = await service.getProfile({
                sub: 1,
                username: 'admin',
                role: 'ADMIN',
            });

            expect(result.username).toBe('admin');
            expect(result).not.toHaveProperty('passwordHash');
        });

        it('should throw UnauthorizedException if user not found', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(null);

            await expect(
                service.getProfile({ sub: 999, username: 'ghost', role: 'ADMIN' }),
            ).rejects.toThrow(UnauthorizedException);
        });
    });
});
