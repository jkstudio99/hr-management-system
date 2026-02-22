import {
    Controller, Get, Post, Patch, Delete,
    Body, Param, Query, ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ExitChecklistsService } from './exit-checklists.service';
import { CreateExitChecklistDto, UpdateExitChecklistDto, QueryExitChecklistDto } from './dto';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth';

@ApiTags('exit-checklists')
@ApiBearerAuth('JWT-Auth')
@Controller('exit-checklists')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExitChecklistsController {
    constructor(private readonly service: ExitChecklistsService) { }

    @Post()
    @Roles('ADMIN', 'HR')
    create(@Body() dto: CreateExitChecklistDto) { return this.service.create(dto); }

    /** POST /api/exit-checklists/generate/:employeeId — Auto-create full checklist */
    @Post('generate/:employeeId')
    @Roles('ADMIN', 'HR')
    generate(@Param('employeeId', ParseIntPipe) employeeId: number) {
        return this.service.generateForEmployee(employeeId);
    }

    @Get()
    findAll(@Query() query: QueryExitChecklistDto) { return this.service.findAll(query); }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }

    /** PATCH — Mark item as completed / assign clearedBy */
    @Patch(':id')
    @Roles('ADMIN', 'HR')
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateExitChecklistDto) {
        return this.service.update(id, dto);
    }

    @Delete(':id')
    @Roles('ADMIN')
    remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}
