// ─────────────────────────────────────────────────────────────────────────────
// PrismaModule — Global database access module
// ─────────────────────────────────────────────────────────────────────────────
// Marked as @Global so PrismaService is available throughout the entire
// application without needing to import PrismaModule in every feature module.
// ─────────────────────────────────────────────────────────────────────────────

import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
    providers: [PrismaService],
    exports: [PrismaService],
})
export class PrismaModule { }
