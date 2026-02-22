import {
    Controller, Get, Post, Patch, Delete,
    Body, Param, Query, ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JobHistoriesService } from './job-histories.service';
import { CreateJobHistoryDto, UpdateJobHistoryDto, QueryJobHistoryDto } from './dto';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth';

@ApiTags('job-histories')
@ApiBearerAuth('JWT-Auth')
@Controller('job-histories')
@UseGuards(JwtAuthGuard, RolesGuard)
export class JobHistoriesController {
    constructor(private readonly service: JobHistoriesService) { }

    @Post()
    @Roles('ADMIN', 'HR')
    create(@Body() dto: CreateJobHistoryDto) { return this.service.create(dto); }

    @Get()
    findAll(@Query() query: QueryJobHistoryDto) { return this.service.findAll(query); }

    @Get('timeline/:employeeId')
    getTimeline(@Param('employeeId', ParseIntPipe) employeeId: number) {
        return this.service.getTimeline(employeeId);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }

    @Patch(':id')
    @Roles('ADMIN', 'HR')
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateJobHistoryDto) {
        return this.service.update(id, dto);
    }

    @Delete(':id')
    @Roles('ADMIN')
    remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}
