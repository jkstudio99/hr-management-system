import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RecruitmentService } from './recruitment.service';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth';

@ApiTags('recruitment')
@ApiBearerAuth('JWT-Auth')
@Controller('recruitment')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'HR')
export class RecruitmentController {
  constructor(private readonly service: RecruitmentService) {}

  @Post('postings')
  createPosting(@Body() dto: any) { return this.service.createPosting(dto); }

  @Get('postings')
  findAllPostings(@Query('page') p?: string, @Query('limit') l?: string, @Query('status') s?: string) {
    return this.service.findAllPostings({ page: p ? +p : 1, limit: l ? +l : 20, status: s });
  }

  @Get('postings/:id')
  findOnePosting(@Param('id') id: string) { return this.service.findOnePosting(+id); }

  @Patch('postings/:id')
  updatePosting(@Param('id') id: string, @Body() dto: any) { return this.service.updatePosting(+id, dto); }

  @Delete('postings/:id')
  removePosting(@Param('id') id: string) { return this.service.removePosting(+id); }

  @Post('postings/:id/applicants')
  createApplicant(@Param('id') id: string, @Body() dto: any) { return this.service.createApplicant(+id, dto); }

  @Patch('applicants/:id/stage')
  updateStage(@Param('id') id: string, @Body('stage') stage: string) { return this.service.updateApplicantStage(+id, stage); }
}
