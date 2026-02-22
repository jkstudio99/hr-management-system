// ─────────────────────────────────────────────────────────────────────────────
// PrismaService — NestJS-managed Prisma Client
// ─────────────────────────────────────────────────────────────────────────────
// Extends PrismaClient so it hooks into Nest's lifecycle for graceful startup
// and shutdown.  Inject this service wherever database access is needed.
//
// Usage:
//   constructor(private readonly prisma: PrismaService) {}
// ─────────────────────────────────────────────────────────────────────────────

import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PrismaService.name);

    /**
     * Connect to the database when the NestJS module initializes.
     * Fail-fast: if the DB is unreachable the app won't start silently broken.
     */
    async onModuleInit(): Promise<void> {
        try {
            await this.$connect();
            this.logger.log('✅ Database connection established');
        } catch (error) {
            this.logger.error('❌ Failed to connect to database', error);
            throw error;
        }
    }

    /**
     * Gracefully close the database connection on app shutdown.
     */
    async onModuleDestroy(): Promise<void> {
        await this.$disconnect();
        this.logger.log('🔌 Database connection closed');
    }
}
