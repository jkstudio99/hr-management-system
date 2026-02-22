import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AnnouncementsService } from './announcements.service';
import { JwtAuthGuard, RolesGuard, Roles, JwtPayload } from '../auth';

@ApiTags('announcements')
@ApiBearerAuth('JWT-Auth')
@Controller('announcements')
@UseGuards(JwtAuthGuard)
export class AnnouncementsController {
  constructor(private readonly service: AnnouncementsService) {}

  @Post()
  @UseGuards(RolesGuard) @Roles('ADMIN', 'HR')
  create(@Body() dto: any, @Request() req: { user: JwtPayload }) {
    return this.service.create(dto, req.user.sub);
  }

  @Get()
  findAll(@Query('page') p?: string, @Query('limit') l?: string, @Query('role') role?: string) {
    return this.service.findAll({ page: p ? +p : 1, limit: l ? +l : 20, role });
  }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(+id); }

  @Patch(':id')
  @UseGuards(RolesGuard) @Roles('ADMIN', 'HR')
  update(@Param('id') id: string, @Body() dto: any) { return this.service.update(+id, dto); }

  @Patch(':id/archive')
  @UseGuards(RolesGuard) @Roles('ADMIN', 'HR')
  archive(@Param('id') id: string) { return this.service.archive(+id); }

  @Delete(':id')
  @UseGuards(RolesGuard) @Roles('ADMIN', 'HR')
  remove(@Param('id') id: string) { return this.service.remove(+id); }
}
