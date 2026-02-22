// ─────────────────────────────────────────────────────────────────────────────
// NotificationsController — User notification endpoints
// ─────────────────────────────────────────────────────────────────────────────

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { QueryNotificationDto } from './dto';
import { JwtAuthGuard, JwtPayload } from '../auth';

@ApiTags('notifications')
@ApiBearerAuth('JWT-Auth')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  /** GET /api/notifications — List current user's notifications */
  @Get()
  findAll(
    @Request() req: { user: JwtPayload },
    @Query() query: QueryNotificationDto,
  ) {
    return this.service.findAllForUser(req.user.sub, query);
  }

  /** GET /api/notifications/unread-count */
  @Get('unread-count')
  getUnreadCount(@Request() req: { user: JwtPayload }) {
    return this.service.getUnreadCount(req.user.sub);
  }

  /** PATCH /api/notifications/:id/read — Mark single notification as read */
  @Patch(':id/read')
  markAsRead(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: JwtPayload },
  ) {
    return this.service.markAsRead(id, req.user.sub);
  }

  /** POST /api/notifications/mark-all-read */
  @Post('mark-all-read')
  markAllAsRead(@Request() req: { user: JwtPayload }) {
    return this.service.markAllAsRead(req.user.sub);
  }

  /** DELETE /api/notifications/:id */
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: JwtPayload },
  ) {
    return this.service.remove(id, req.user.sub);
  }
}
