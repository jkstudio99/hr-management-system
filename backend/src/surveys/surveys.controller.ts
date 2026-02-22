// ─────────────────────────────────────────────────────────────────────────────
// SurveysController — Pulse survey endpoints
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
import { SurveysService } from './surveys.service';
import { CreateSurveyDto, UpdateSurveyDto, SubmitSurveyDto, QuerySurveyDto } from './dto';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth';

@ApiTags('surveys')
@ApiBearerAuth('JWT-Auth')
@Controller('surveys')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SurveysController {
  constructor(private readonly service: SurveysService) {}

  /** POST /api/surveys — Create survey with questions (Admin/HR) */
  @Post()
  @Roles('ADMIN', 'HR')
  create(@Body() dto: CreateSurveyDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query() query: QuerySurveyDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'HR')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSurveyDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  /** POST /api/surveys/:id/respond — Submit anonymous responses */
  @Post(':id/respond')
  submitResponses(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SubmitSurveyDto,
  ) {
    return this.service.submitResponses(id, dto);
  }

  /** GET /api/surveys/:id/results — Aggregated results (Admin/HR) */
  @Get(':id/results')
  @Roles('ADMIN', 'HR')
  getResults(@Param('id', ParseIntPipe) id: number) {
    return this.service.getResults(id);
  }
}
