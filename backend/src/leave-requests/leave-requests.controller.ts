// ─────────────────────────────────────────────────────────────────────────────
// LeaveRequestsController — RESTful endpoints for leave management
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
import { LeaveRequestsService } from './leave-requests.service';
import {
    CreateLeaveRequestDto,
    UpdateLeaveRequestDto,
    QueryLeaveRequestDto,
} from './dto';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth';

@ApiTags('leave-requests')
@ApiBearerAuth('JWT-Auth')
@Controller('leave-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeaveRequestsController {
    constructor(private readonly leaveRequestsService: LeaveRequestsService) { }

    /** POST /api/leave-requests — Any authenticated user can request leave */
    @Post()
    create(@Body() dto: CreateLeaveRequestDto) {
        return this.leaveRequestsService.create(dto);
    }

    /** GET /api/leave-requests — List with filters (Admin/HR see all) */
    @Get()
    findAll(@Query() query: QueryLeaveRequestDto) {
        return this.leaveRequestsService.findAll(query);
    }

    /** GET /api/leave-requests/:id */
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.leaveRequestsService.findOne(id);
    }

    /** PATCH /api/leave-requests/:id — Admin/HR can approve/reject */
    @Patch(':id')
    @Roles('ADMIN', 'HR')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateLeaveRequestDto,
    ) {
        return this.leaveRequestsService.update(id, dto);
    }

    /** DELETE /api/leave-requests/:id — Admin only */
    @Delete(':id')
    @Roles('ADMIN')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.leaveRequestsService.remove(id);
    }
}
