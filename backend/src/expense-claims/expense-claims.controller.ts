// ─────────────────────────────────────────────────────────────────────────────
// ExpenseClaimsController — RESTful endpoints for expense/reimbursement claims
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
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ExpenseClaimsService } from './expense-claims.service';
import {
  CreateExpenseClaimDto,
  UpdateExpenseClaimDto,
  QueryExpenseClaimDto,
} from './dto';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth';

@ApiTags('expense-claims')
@ApiBearerAuth('JWT-Auth')
@Controller('expense-claims')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExpenseClaimsController {
  constructor(private readonly service: ExpenseClaimsService) {}

  @Post()
  create(@Body() dto: CreateExpenseClaimDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query() query: QueryExpenseClaimDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  /** PATCH — Admin/HR approve/reject or update claim */
  @Patch(':id')
  @Roles('ADMIN', 'HR')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateExpenseClaimDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
