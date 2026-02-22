import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ShiftsService } from './shifts.service';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth';

@ApiTags('shifts')
@ApiBearerAuth('JWT-Auth')
@Controller('shifts')
@UseGuards(JwtAuthGuard)
export class ShiftsController {
  constructor(private readonly service: ShiftsService) {}

  @Post()
  @UseGuards(RolesGuard) @Roles('ADMIN', 'HR')
  createShift(@Body() dto: any) { return this.service.createShift(dto); }

  @Get()
  findAll() { return this.service.findAllShifts(); }

  @Patch(':id')
  @UseGuards(RolesGuard) @Roles('ADMIN', 'HR')
  update(@Param('id') id: string, @Body() dto: any) { return this.service.updateShift(+id, dto); }

  @Post('assign')
  @UseGuards(RolesGuard) @Roles('ADMIN', 'HR')
  assign(@Body() dto: any) { return this.service.assignShift(dto); }

  @Get('schedule')
  getSchedule(@Query('employeeId') e?: string, @Query('startDate') s?: string, @Query('endDate') ed?: string) {
    return this.service.getSchedule({ employeeId: e ? +e : undefined, startDate: s, endDate: ed });
  }

  @Delete('assignments/:id')
  @UseGuards(RolesGuard) @Roles('ADMIN', 'HR')
  removeAssignment(@Param('id') id: string) { return this.service.removeAssignment(+id); }
}
