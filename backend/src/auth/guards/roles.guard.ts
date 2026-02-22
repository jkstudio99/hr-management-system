// ─────────────────────────────────────────────────────────────────────────────
// RolesGuard — Enforces role-based access control (RBAC)
// ─────────────────────────────────────────────────────────────────────────────
// Works in conjunction with the @Roles() decorator. If no @Roles() metadata
// is found on the handler or its controller, the route is open to any
// authenticated user. If roles are specified, the user's role (from JWT)
// must match at least one.
//
// ⚠️  This guard must run AFTER JwtAuthGuard, since it reads `request.user`.
// ─────────────────────────────────────────────────────────────────────────────

import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        // ── 1. Check for @Roles() metadata ──────────────────────────────────
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(
            ROLES_KEY,
            [context.getHandler(), context.getClass()],
        );

        // No @Roles() decorator → allow any authenticated user through
        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        // ── 2. Validate user's role against required roles ──────────────────
        const { user } = context.switchToHttp().getRequest();

        if (!user || !user.role) {
            throw new ForbiddenException('Access denied: no role assigned');
        }

        const hasRole = requiredRoles.includes(user.role);

        if (!hasRole) {
            throw new ForbiddenException(
                `Access denied: requires one of [${requiredRoles.join(', ')}]`,
            );
        }

        return true;
    }
}
