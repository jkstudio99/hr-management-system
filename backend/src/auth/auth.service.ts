// ─────────────────────────────────────────────────────────────────────────────
// AuthService — Core authentication business logic
// ─────────────────────────────────────────────────────────────────────────────
// Handles:
//   • User registration  — creates account with bcrypt-hashed password
//   • User login          — validates credentials, issues JWT
//   • Password comparison — constant-time bcrypt comparison
//
// Security considerations:
//   • Bcrypt work factor 12 (industry standard)
//   • Generic error messages to prevent user-enumeration attacks
//   • Passwords are NEVER logged or returned in responses
// ─────────────────────────────────────────────────────────────────────────────

import {
    Injectable,
    UnauthorizedException,
    ConflictException,
    Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma';
import { LoginDto, RegisterDto } from './dto';
import { JwtPayload } from './interfaces';

/** BCrypt cost factor — 12 rounds is the industry-recommended minimum. */
const BCRYPT_SALT_ROUNDS = 12;

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) { }

    // ── Register ──────────────────────────────────────────────────────────

    /**
     * Create a new user account.
     *
     * @throws ConflictException if username or email already exists
     * @returns The newly created user (sans password) and a JWT token
     */
    async register(dto: RegisterDto) {
        // Check for existing username or email (prevent duplicate-key DB errors)
        const existingUser = await this.prisma.user.findFirst({
            where: {
                OR: [{ username: dto.username }, { email: dto.email }],
            },
        });

        if (existingUser) {
            throw new ConflictException(
                existingUser.username === dto.username
                    ? 'Username already taken'
                    : 'Email already registered',
            );
        }

        // Hash password with bcrypt (12 salt rounds)
        const passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

        // Default new users to the "EMPLOYEE" role
        const employeeRole = await this.prisma.role.findUnique({
            where: { roleName: 'EMPLOYEE' },
        });

        if (!employeeRole) {
            // This should never happen if seed ran correctly
            throw new Error('Default EMPLOYEE role not found — run seed first');
        }

        const user = await this.prisma.user.create({
            data: {
                username: dto.username,
                email: dto.email,
                passwordHash,
                roleId: employeeRole.id,
            },
            include: { role: true },
        });

        // Issue JWT immediately after registration
        const token = this.generateToken(user.id, user.username, user.role.roleName);

        this.logger.log(`New user registered: ${user.username}`);

        return {
            user: this.sanitizeUser(user),
            accessToken: token,
        };
    }

    // ── Login ─────────────────────────────────────────────────────────────

    /**
     * Validate credentials and issue a JWT.
     *
     * @throws UnauthorizedException for invalid username OR password
     *         (generic message prevents user-enumeration)
     */
    async login(dto: LoginDto) {
        // Fetch user with role — fail with generic message if not found
        const user = await this.prisma.user.findUnique({
            where: { username: dto.username },
            include: { role: true },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid username or password');
        }

        // Check if user account is active
        if (!user.isActive) {
            throw new UnauthorizedException('Account has been deactivated');
        }

        // Constant-time password comparison via bcrypt
        const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid username or password');
        }

        // Issue JWT
        const token = this.generateToken(user.id, user.username, user.role.roleName);

        this.logger.log(`User logged in: ${user.username}`);

        return {
            user: this.sanitizeUser(user),
            accessToken: token,
        };
    }

    // ── Profile ───────────────────────────────────────────────────────────

    /**
     * Fetch the current user's profile from a validated JWT payload.
     */
    async getProfile(payload: JwtPayload) {
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
            include: { role: true, employee: true },
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        return this.sanitizeUser(user);
    }

    // ── Private Helpers ───────────────────────────────────────────────────

    /**
     * Generate a signed JWT containing user claims.
     */
    private generateToken(userId: number, username: string, role: string): string {
        const payload: JwtPayload = {
            sub: userId,
            username,
            role,
        };

        return this.jwtService.sign(payload);
    }

    /**
     * Remove sensitive fields (passwordHash) before returning user data.
     * This is a defense-in-depth measure — even if serialization changes,
     * the password hash is never in the response object.
     */
    private sanitizeUser(user: any) {
        const { passwordHash, ...sanitized } = user;
        return sanitized;
    }
}
