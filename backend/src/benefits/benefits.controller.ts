import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { BenefitsService } from './benefits.service';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth';

@ApiTags('benefits')
@ApiBearerAuth('JWT-Auth')
@Controller('benefits')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'HR')
export class BenefitsController {
  constructor(private readonly service: BenefitsService) {}

  @Post('plans')
  createPlan(@Body() dto: any) { return this.service.createPlan(dto); }

  @Get('plans')
  findAllPlans(@Query('page') p?: string, @Query('limit') l?: string) {
    return this.service.findAllPlans({ page: p ? +p : 1, limit: l ? +l : 20 });
  }

  @Get('plans/:id')
  findOnePlan(@Param('id') id: string) { return this.service.findOnePlan(+id); }

  @Patch('plans/:id')
  updatePlan(@Param('id') id: string, @Body() dto: any) { return this.service.updatePlan(+id, dto); }

  @Delete('plans/:id')
  removePlan(@Param('id') id: string) { return this.service.removePlan(+id); }

  @Post('plans/:id/enroll')
  enroll(@Param('id') id: string, @Body() dto: { employeeId: number; startDate: string }) {
    return this.service.enrollEmployee(+id, dto.employeeId, dto.startDate);
  }

  @Patch('enrollments/:id/unenroll')
  unenroll(@Param('id') id: string) { return this.service.unenroll(+id); }
}
