// ─────────────────────────────────────────────────────────────────────────────
// TwoFactorController — 2FA setup, verify, disable endpoints
// ─────────────────────────────────────────────────────────────────────────────

import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TwoFactorService } from './two-factor.service';
import { TwoFactorCodeDto } from './dto';
import { JwtAuthGuard, JwtPayload } from '../auth';

@ApiTags('2fa')
@ApiBearerAuth('JWT-Auth')
@Controller('2fa')
@UseGuards(JwtAuthGuard)
export class TwoFactorController {
  constructor(private readonly service: TwoFactorService) {}

  /** GET /api/2fa/status — Check if 2FA is enabled */
  @Get('status')
  getStatus(@Request() req: { user: JwtPayload }) {
    return this.service.getStatus(req.user.sub);
  }

  /** POST /api/2fa/setup — Generate secret + QR code */
  @Post('setup')
  setup(@Request() req: { user: JwtPayload }) {
    return this.service.setup(req.user.sub);
  }

  /** POST /api/2fa/verify — Verify code and enable 2FA */
  @Post('verify')
  verify(
    @Request() req: { user: JwtPayload },
    @Body() dto: TwoFactorCodeDto,
  ) {
    return this.service.verify(req.user.sub, dto.code);
  }

  /** POST /api/2fa/disable — Disable 2FA (requires current code) */
  @Post('disable')
  disable(
    @Request() req: { user: JwtPayload },
    @Body() dto: TwoFactorCodeDto,
  ) {
    return this.service.disable(req.user.sub, dto.code);
  }
}
