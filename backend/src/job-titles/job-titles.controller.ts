// ─────────────────────────────────────────────────────────────────────────────
// JobTitlesController — RESTful endpoints for job titles
// ─────────────────────────────────────────────────────────────────────────────

import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    ParseIntPipe,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JobTitlesService } from './job-titles.service';
import { CreateJobTitleDto, UpdateJobTitleDto } from './dto';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth';

@ApiTags('job-titles')
@ApiBearerAuth('JWT-Auth')
@Controller('job-titles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class JobTitlesController {
    constructor(private readonly jobTitlesService: JobTitlesService) { }

    @Post()
    @Roles('ADMIN', 'HR')
    create(@Body() dto: CreateJobTitleDto) {
        return this.jobTitlesService.create(dto);
    }

    @Get()
    findAll() {
        return this.jobTitlesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.jobTitlesService.findOne(id);
    }

    @Patch(':id')
    @Roles('ADMIN', 'HR')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateJobTitleDto,
    ) {
        return this.jobTitlesService.update(id, dto);
    }

    @Delete(':id')
    @Roles('ADMIN')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.jobTitlesService.remove(id);
    }
}
