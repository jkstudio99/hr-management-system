// ─────────────────────────────────────────────────────────────────────────────
// @Roles() Decorator — Metadata for RBAC authorization
// ─────────────────────────────────────────────────────────────────────────────
// Attach to a controller class or individual handler to restrict access.
//
// Usage:
//   @Roles('ADMIN', 'HR')
//   @UseGuards(JwtAuthGuard, RolesGuard)
//   @Get('admin-only')
//   getAdminData() { ... }
// ─────────────────────────────────────────────────────────────────────────────

import { SetMetadata } from '@nestjs/common';

/** Metadata key used by RolesGuard to retrieve required roles. */
export const ROLES_KEY = 'roles';

/**
 * Decorator that assigns required roles to a route handler or controller.
 *
 * @param roles - One or more role names (e.g. 'ADMIN', 'HR', 'EMPLOYEE')
 *
 * @example
 * ```ts
 * @Roles('ADMIN')
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Delete(':id')
 * remove(@Param('id') id: number) { ... }
 * ```
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
