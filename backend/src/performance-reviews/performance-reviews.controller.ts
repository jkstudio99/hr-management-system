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
import { PerformanceReviewsService } from './performance-reviews.service';
import {
  CreatePerformanceReviewDto,
  UpdatePerformanceReviewDto,
  QueryPerformanceReviewDto,
} from './dto';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth';

@ApiTags('performance-reviews')
@ApiBearerAuth('JWT-Auth')
@Controller('performance-reviews')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PerformanceReviewsController {
  constructor(private readonly service: PerformanceReviewsService) {}

  @Post()
  @Roles('ADMIN', 'HR')
  create(@Body() dto: CreatePerformanceReviewDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query() query: QueryPerformanceReviewDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'HR')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePerformanceReviewDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
