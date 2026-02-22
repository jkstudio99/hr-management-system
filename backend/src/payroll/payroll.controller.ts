// ─────────────────────────────────────────────────────────────────────────────
// PayrollController — Monthly payroll management endpoints
// ─────────────────────────────────────────────────────────────────────────────

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PayrollService } from './payroll.service';
import {
  CreatePayrollRunDto,
  ProcessPayrollDto,
  UpdatePayrollItemDto,
  QueryPayrollDto,
} from './dto';
import { JwtAuthGuard, RolesGuard, Roles, JwtPayload } from '../auth';

@ApiTags('payroll')
@ApiBearerAuth('JWT-Auth')
@Controller('payroll')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'HR')
export class PayrollController {
  constructor(private readonly service: PayrollService) {}

  /** POST /api/payroll — Create payroll run for a period */
  @Post()
  create(
    @Body() dto: CreatePayrollRunDto,
    @Request() req: { user: JwtPayload },
  ) {
    return this.service.create(dto, req.user.sub);
  }

  @Get()
  findAll(@Query() query: QueryPayrollDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  /** PATCH /api/payroll/items/:itemId — Update allowances/deductions */
  @Patch('items/:itemId')
  updateItem(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() dto: UpdatePayrollItemDto,
  ) {
    return this.service.updateItem(itemId, dto);
  }

  /** POST /api/payroll/:id/process — Calculate tax, SSO, netPay */
  @Post(':id/process')
  process(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ProcessPayrollDto,
  ) {
    return this.service.process(id, dto);
  }

  /** POST /api/payroll/:id/complete — Finalize payroll run */
  @Post(':id/complete')
  complete(@Param('id', ParseIntPipe) id: number) {
    return this.service.complete(id);
  }

  /** DELETE /api/payroll/:id — Delete DRAFT payroll run */
  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
