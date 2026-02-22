// ─────────────────────────────────────────────────────────────────────────────
// JWT Payload Interface
// ─────────────────────────────────────────────────────────────────────────────
// Defines the shape of the JWT token claims. This interface is shared between
// the JwtStrategy (token verification) and AuthService (token creation).
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Claims embedded inside every JWT issued by this system.
 *
 * @property sub      - User ID (standard JWT "subject" claim)
 * @property username - Human-readable identifier
 * @property role     - Role name for RBAC (e.g. "ADMIN", "HR", "EMPLOYEE")
 */
export interface JwtPayload {
    /** User primary key */
    sub: number;

    /** Username for display / audit purposes */
    username: string;

    /** Role name used by RolesGuard for authorization checks */
    role: string;
}
