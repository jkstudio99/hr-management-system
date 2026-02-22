// ─────────────────────────────────────────────────────────────────────────────
// DepartmentsController — RESTful endpoints for departments
// ─────────────────────────────────────────────────────────────────────────────
// All routes are protected by JwtAuthGuard.
// Admin/HR-only operations use @Roles() + RolesGuard.
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
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth';

@ApiTags('departments')
@ApiBearerAuth('JWT-Auth')
@Controller('departments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DepartmentsController {
    constructor(private readonly departmentsService: DepartmentsService) { }

    /** POST /api/departments — Admin/HR only */
    @Post()
    @Roles('ADMIN', 'HR')
    create(@Body() dto: CreateDepartmentDto) {
        return this.departmentsService.create(dto);
    }

    /** GET /api/departments — Any authenticated user */
    @Get()
    findAll() {
        return this.departmentsService.findAll();
    }

    /** GET /api/departments/:id — Any authenticated user */
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.departmentsService.findOne(id);
    }

    /** PATCH /api/departments/:id — Admin/HR only */
    @Patch(':id')
    @Roles('ADMIN', 'HR')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateDepartmentDto,
    ) {
        return this.departmentsService.update(id, dto);
    }

    /** DELETE /api/departments/:id — Admin only */
    @Delete(':id')
    @Roles('ADMIN')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.departmentsService.remove(id);
    }
}
