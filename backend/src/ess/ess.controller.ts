// ─────────────────────────────────────────────────────────────────────────────
// EssController — Employee Self-Service Portal endpoints
// ─────────────────────────────────────────────────────────────────────────────

import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { EssService } from './ess.service';
import {
  EssSubmitLeaveDto,
  EssSubmitExpenseDto,
  EssPaginationDto,
} from './dto';
import { JwtAuthGuard, JwtPayload } from '../auth';

@ApiTags('ess')
@ApiBearerAuth('JWT-Auth')
@Controller('ess')
@UseGuards(JwtAuthGuard)
export class EssController {
  constructor(private readonly service: EssService) {}

  /** GET /api/ess/profile — My employee profile */
  @Get('profile')
  getMyProfile(@Request() req: { user: JwtPayload }) {
    return this.service.getMyProfile(req.user.sub);
  }

  /** GET /api/ess/leaves — My leave requests */
  @Get('leaves')
  getMyLeaves(
    @Request() req: { user: JwtPayload },
    @Query() query: EssPaginationDto,
  ) {
    return this.service.getMyLeaves(req.user.sub, query.page, query.limit);
  }

  /** POST /api/ess/leaves — Submit a leave request */
  @Post('leaves')
  submitLeave(
    @Request() req: { user: JwtPayload },
    @Body() dto: EssSubmitLeaveDto,
  ) {
    return this.service.submitLeave(req.user.sub, dto);
  }

  /** GET /api/ess/assets — My assigned assets */
  @Get('assets')
  getMyAssets(@Request() req: { user: JwtPayload }) {
    return this.service.getMyAssets(req.user.sub);
  }

  /** GET /api/ess/expense-claims — My expense claims */
  @Get('expense-claims')
  getMyExpenseClaims(
    @Request() req: { user: JwtPayload },
    @Query() query: EssPaginationDto,
  ) {
    return this.service.getMyExpenseClaims(
      req.user.sub,
      query.page,
      query.limit,
    );
  }

  /** POST /api/ess/expense-claims — Submit an expense claim */
  @Post('expense-claims')
  submitExpenseClaim(
    @Request() req: { user: JwtPayload },
    @Body() dto: EssSubmitExpenseDto,
  ) {
    return this.service.submitExpenseClaim(req.user.sub, dto);
  }

  /** GET /api/ess/reviews — My performance reviews */
  @Get('reviews')
  getMyReviews(@Request() req: { user: JwtPayload }) {
    return this.service.getMyReviews(req.user.sub);
  }

  /** GET /api/ess/payslips — My payslips */
  @Get('payslips')
  getMyPayslips(@Request() req: { user: JwtPayload }) {
    return this.service.getMyPayslips(req.user.sub);
  }
}
