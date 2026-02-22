// ─────────────────────────────────────────────────────────────────────────────
// EmployeesController — RESTful endpoints for employee management
// ─────────────────────────────────────────────────────────────────────────────
// All routes protected by JwtAuthGuard. Write operations require Admin/HR role.
//
// Endpoints:
//   POST   /api/employees         — Create employee (Admin/HR)
//   GET    /api/employees         — List with pagination & search (All)
//   GET    /api/employees/:id     — Get employee with nested relations (All)
//   PATCH  /api/employees/:id     — Update employee (Admin/HR)
//   DELETE /api/employees/:id     — Soft-delete employee (Admin only)
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
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto, UpdateEmployeeDto, QueryEmployeeDto } from './dto';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth';

@ApiTags('employees')
@ApiBearerAuth('JWT-Auth')
@Controller('employees')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmployeesController {
    constructor(private readonly employeesService: EmployeesService) { }

    @Post()
    @Roles('ADMIN', 'HR')
    create(@Body() dto: CreateEmployeeDto) {
        return this.employeesService.create(dto);
    }

    @Get()
    findAll(@Query() query: QueryEmployeeDto) {
        return this.employeesService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.employeesService.findOne(id);
    }

    @Patch(':id')
    @Roles('ADMIN', 'HR')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateEmployeeDto,
    ) {
        return this.employeesService.update(id, dto);
    }

    @Delete(':id')
    @Roles('ADMIN')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.employeesService.remove(id);
    }
}
