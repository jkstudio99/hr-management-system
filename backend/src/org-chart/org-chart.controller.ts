import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { OrgChartService } from './org-chart.service';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth';

@ApiTags('org-chart')
@ApiBearerAuth('JWT-Auth')
@Controller('org-chart')
@UseGuards(JwtAuthGuard)
export class OrgChartController {
  constructor(private readonly service: OrgChartService) {}

  @Get('tree')
  getTree() { return this.service.getTree(); }

  @Get(':employeeId/subordinates')
  getSubordinates(@Param('employeeId') id: string) { return this.service.getSubordinates(+id); }

  @Patch(':employeeId/manager')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'HR')
  setManager(@Param('employeeId') id: string, @Body('managerId') managerId: number | null) {
    return this.service.setManager(+id, managerId);
  }
}
