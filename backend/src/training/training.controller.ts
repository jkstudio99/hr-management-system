import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TrainingService } from './training.service';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth';

@ApiTags('training')
@ApiBearerAuth('JWT-Auth')
@Controller('training')
@UseGuards(JwtAuthGuard)
export class TrainingController {
  constructor(private readonly service: TrainingService) {}

  @Post('courses')
  @UseGuards(RolesGuard) @Roles('ADMIN', 'HR')
  create(@Body() dto: any) { return this.service.createCourse(dto); }

  @Get('courses')
  findAll(@Query('page') p?: string, @Query('limit') l?: string) {
    return this.service.findAllCourses({ page: p ? +p : 1, limit: l ? +l : 20 });
  }

  @Get('courses/:id')
  findOne(@Param('id') id: string) { return this.service.findOneCourse(+id); }

  @Patch('courses/:id')
  @UseGuards(RolesGuard) @Roles('ADMIN', 'HR')
  update(@Param('id') id: string, @Body() dto: any) { return this.service.updateCourse(+id, dto); }

  @Delete('courses/:id')
  @UseGuards(RolesGuard) @Roles('ADMIN', 'HR')
  remove(@Param('id') id: string) { return this.service.removeCourse(+id); }

  @Post('courses/:id/enroll')
  @UseGuards(RolesGuard) @Roles('ADMIN', 'HR')
  enroll(@Param('id') id: string, @Body('employeeId') empId: number) { return this.service.enroll(+id, empId); }

  @Patch('enrollments/:id')
  @UseGuards(RolesGuard) @Roles('ADMIN', 'HR')
  updateEnrollment(@Param('id') id: string, @Body() dto: any) { return this.service.updateEnrollment(+id, dto); }
}
