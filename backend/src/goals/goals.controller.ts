import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { GoalsService } from './goals.service';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth';

@ApiTags('goals')
@ApiBearerAuth('JWT-Auth')
@Controller('goals')
@UseGuards(JwtAuthGuard)
export class GoalsController {
  constructor(private readonly service: GoalsService) {}

  @Post()
  create(@Body() dto: any) { return this.service.create(dto); }

  @Get()
  findAll(@Query('page') p?: string, @Query('limit') l?: string, @Query('employeeId') e?: string, @Query('period') period?: string) {
    return this.service.findAll({ page: p ? +p : 1, limit: l ? +l : 20, employeeId: e ? +e : undefined, period });
  }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(+id); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: any) { return this.service.update(+id, dto); }

  @Patch('key-results/:id')
  updateKR(@Param('id') id: string, @Body() dto: any) { return this.service.updateKeyResult(+id, dto); }

  @Delete(':id')
  @UseGuards(RolesGuard) @Roles('ADMIN', 'HR')
  remove(@Param('id') id: string) { return this.service.remove(+id); }
}
