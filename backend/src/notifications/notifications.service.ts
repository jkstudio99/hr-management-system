// ─────────────────────────────────────────────────────────────────────────────
// NotificationsService — System notification management + Contract Expiry Cron
// ─────────────────────────────────────────────────────────────────────────────
// Features:
//   • CRUD for notifications per user
//   • Mark as read / mark all as read
//   • Unread count
//   • Cron job: scans for expiring contracts/documents every midnight
// ─────────────────────────────────────────────────────────────────────────────

import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma';
import { CreateNotificationDto, QueryNotificationDto } from './dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: dto,
    });
  }

  async findAllForUser(userId: number, query: QueryNotificationDto) {
    const { page = 1, limit = 20, isRead } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.NotificationWhereInput = { userId };
    if (isRead !== undefined) where.isRead = isRead === 'true';

    const [data, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return {
      data,
      unreadCount,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async markAsRead(id: number, userId: number) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });
    if (!notification) {
      throw new NotFoundException(`Notification #${id} not found`);
    }

    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: number) {
    const result = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return { message: `${result.count} notifications marked as read` };
  }

  async getUnreadCount(userId: number) {
    const count = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });
    return { unreadCount: count };
  }

  async remove(id: number, userId: number) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });
    if (!notification) {
      throw new NotFoundException(`Notification #${id} not found`);
    }
    await this.prisma.notification.delete({ where: { id } });
    return { message: `Notification #${id} deleted` };
  }

  // ── Contract & Document Expiry Cron ─────────────────────────────────────

  /** Runs every day at midnight — scans for expiring contracts/documents */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkExpiringDocuments() {
    this.logger.log('🔍 Running contract/document expiry scan...');

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const today = new Date();

    // Find employees with expiring contracts
    const expiringEmployees = await this.prisma.employee.findMany({
      where: {
        isActive: true,
        OR: [
          {
            contractEndDate: { gte: today, lte: thirtyDaysFromNow },
          },
          {
            idCardExpiry: { gte: today, lte: thirtyDaysFromNow },
          },
          {
            workPermitExpiry: { gte: today, lte: thirtyDaysFromNow },
          },
        ],
      },
      include: { user: { select: { id: true } } },
    });

    if (expiringEmployees.length === 0) {
      this.logger.log('✅ No expiring contracts/documents found');
      return;
    }

    // Find all HR/Admin users to notify
    const hrAdminUsers = await this.prisma.user.findMany({
      where: {
        isActive: true,
        role: { roleName: { in: ['ADMIN', 'HR'] } },
      },
      select: { id: true },
    });

    const notifications: Prisma.NotificationCreateManyInput[] = [];

    for (const emp of expiringEmployees) {
      const alerts: string[] = [];

      if (
        emp.contractEndDate &&
        emp.contractEndDate >= today &&
        emp.contractEndDate <= thirtyDaysFromNow
      ) {
        alerts.push(
          `Contract expires on ${emp.contractEndDate.toISOString().split('T')[0]}`,
        );
      }
      if (
        emp.idCardExpiry &&
        emp.idCardExpiry >= today &&
        emp.idCardExpiry <= thirtyDaysFromNow
      ) {
        alerts.push(
          `ID card expires on ${emp.idCardExpiry.toISOString().split('T')[0]}`,
        );
      }
      if (
        emp.workPermitExpiry &&
        emp.workPermitExpiry >= today &&
        emp.workPermitExpiry <= thirtyDaysFromNow
      ) {
        alerts.push(
          `Work permit expires on ${emp.workPermitExpiry.toISOString().split('T')[0]}`,
        );
      }

      for (const user of hrAdminUsers) {
        notifications.push({
          userId: user.id,
          title: `⚠️ Document Expiry: ${emp.firstName} ${emp.lastName}`,
          message: alerts.join('; '),
          type: 'ALERT',
        });
      }
    }

    if (notifications.length > 0) {
      await this.prisma.notification.createMany({
        data: notifications,
        skipDuplicates: true,
      });
    }

    this.logger.log(
      `📢 Created ${notifications.length} expiry alert notifications for ${expiringEmployees.length} employees`,
    );
  }
}
