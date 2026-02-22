import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth';

@ApiTags('documents')
@ApiBearerAuth('JWT-Auth')
@Controller('documents')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'HR')
export class DocumentsController {
  constructor(private readonly service: DocumentsService) {}

  @Post()
  create(@Body() dto: any) { return this.service.create(dto); }

  @Get()
  findAll(@Query('page') p?: string, @Query('limit') l?: string, @Query('category') c?: string, @Query('employeeId') e?: string) {
    return this.service.findAll({ page: p ? +p : 1, limit: l ? +l : 20, category: c, employeeId: e ? +e : undefined });
  }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(+id); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: any) { return this.service.update(+id, dto); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove(+id); }
}
