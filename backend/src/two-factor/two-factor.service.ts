// ─────────────────────────────────────────────────────────────────────────────
// TwoFactorService — TOTP-based Two-Factor Authentication
// ─────────────────────────────────────────────────────────────────────────────
// Flow:
//   1. User calls POST /2fa/setup → receives secret + QR code data URI
//   2. User scans QR with authenticator app (Google Authenticator, Authy, etc.)
//   3. User calls POST /2fa/verify with the 6-digit code to enable 2FA
//   4. On subsequent logins, if 2FA is enabled, user must provide TOTP code
//   5. User can disable 2FA via POST /2fa/disable
// ─────────────────────────────────────────────────────────────────────────────

import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { generateSecret, generateURI, verify as otpVerify } from 'otplib';
import * as QRCode from 'qrcode';
import { PrismaService } from '../prisma';

@Injectable()
export class TwoFactorService {
  private readonly logger = new Logger(TwoFactorService.name);
  private readonly APP_NAME = 'HR-Management-System';

  constructor(private readonly prisma: PrismaService) {}

  /** Verify a TOTP token against a secret (async — otplib v4 returns Promise) */
  private async verifyToken(token: string, secret: string): Promise<boolean> {
    try {
      const result = await otpVerify({ token, secret });
      return typeof result === 'boolean' ? result : !!(result as any)?.valid;
    } catch {
      return false;
    }
  }

  /** Generate a new TOTP secret and QR code for setup */
  async setup(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, isTwoFactorEnabled: true },
    });

    if (!user) throw new BadRequestException('User not found');
    if (user.isTwoFactorEnabled) {
      throw new BadRequestException(
        '2FA is already enabled. Disable it first to re-setup.',
      );
    }

    const secret = generateSecret();

    // Store secret (not yet enabled — user must verify first)
    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret },
    });

    const otpauthUrl = generateURI({
      label: user.username,
      issuer: this.APP_NAME,
      secret,
    });
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

    this.logger.log(`2FA setup initiated for user #${userId}`);

    return {
      secret,
      qrCodeDataUrl,
      otpauthUrl,
      message:
        'Scan the QR code with your authenticator app, then verify with a code.',
    };
  }

  /** Verify TOTP code and enable 2FA */
  async verify(userId: number, code: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, twoFactorSecret: true, isTwoFactorEnabled: true },
    });

    if (!user) throw new BadRequestException('User not found');
    if (!user.twoFactorSecret) {
      throw new BadRequestException(
        'Call /2fa/setup first to generate a secret',
      );
    }
    if (user.isTwoFactorEnabled) {
      throw new BadRequestException('2FA is already enabled');
    }

    const isValid = await this.verifyToken(code, user.twoFactorSecret);

    if (!isValid) {
      throw new UnauthorizedException('Invalid 2FA code. Please try again.');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { isTwoFactorEnabled: true },
    });

    this.logger.log(`2FA enabled for user #${userId}`);
    return { message: '2FA has been successfully enabled' };
  }

  /** Validate a TOTP code (used during login if 2FA is enabled) */
  async validateCode(userId: number, code: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { twoFactorSecret: true, isTwoFactorEnabled: true },
    });

    if (!user?.isTwoFactorEnabled || !user.twoFactorSecret) {
      return true; // 2FA not enabled — pass through
    }

    return this.verifyToken(code, user.twoFactorSecret);
  }

  /** Disable 2FA */
  async disable(userId: number, code: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, twoFactorSecret: true, isTwoFactorEnabled: true },
    });

    if (!user) throw new BadRequestException('User not found');
    if (!user.isTwoFactorEnabled) {
      throw new BadRequestException('2FA is not currently enabled');
    }

    // Must verify current code before disabling
    const isValid = await this.verifyToken(code, user.twoFactorSecret!);

    if (!isValid) {
      throw new UnauthorizedException('Invalid 2FA code. Cannot disable.');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: null, isTwoFactorEnabled: false },
    });

    this.logger.log(`2FA disabled for user #${userId}`);
    return { message: '2FA has been disabled' };
  }

  /** Check if user has 2FA enabled */
  async getStatus(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { isTwoFactorEnabled: true },
    });
    return { isTwoFactorEnabled: user?.isTwoFactorEnabled ?? false };
  }
}
