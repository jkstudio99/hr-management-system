import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { OvertimeService } from './overtime.service';
import { JwtAuthGuard, RolesGuard, Roles, JwtPayload } from '../auth';

@ApiTags('overtime')
@ApiBearerAuth('JWT-Auth')
@Controller('overtime')
@UseGuards(JwtAuthGuard)
export class OvertimeController {
  constructor(private readonly service: OvertimeService) {}

  @Post('requests')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'HR')
  createOt(@Body() dto: { employeeId: number; date: string; hours: number; reason?: string }) {
    return this.service.createOtRequest(dto);
  }

  @Get('requests')
  findAllOt(@Query('page') p?: string, @Query('limit') l?: string, @Query('status') s?: string, @Query('employeeId') e?: string) {
    return this.service.findAllOtRequests({ page: p ? +p : 1, limit: l ? +l : 20, status: s, employeeId: e ? +e : undefined });
  }

  @Patch('requests/:id/approve')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'HR')
  approve(@Param('id') id: string, @Request() req: { user: JwtPayload }) {
    return this.service.approveOt(+id, req.user.sub);
  }

  @Patch('requests/:id/reject')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'HR')
  reject(@Param('id') id: string, @Request() req: { user: JwtPayload }) {
    return this.service.rejectOt(+id, req.user.sub);
  }

  @Post('clock-in')
  clockIn(@Request() req: { user: JwtPayload }) {
    return this.service.clockIn(req.user.sub);
  }

  @Post('clock-out')
  clockOut(@Request() req: { user: JwtPayload }) {
    return this.service.clockOut(req.user.sub);
  }

  @Get('timesheet')
  getTimesheet(@Query('employeeId') empId: string, @Query('month') month?: string) {
    return this.service.getTimesheet(+empId, month);
  }
}
