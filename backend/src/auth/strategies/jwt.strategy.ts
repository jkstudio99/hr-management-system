// ─────────────────────────────────────────────────────────────────────────────
// JWT Strategy — Passport strategy for Bearer token authentication
// ─────────────────────────────────────────────────────────────────────────────
// Extracts the JWT from the Authorization header, verifies it against the
// secret, and attaches the decoded payload to `request.user`.
//
// This runs on every request guarded by @UseGuards(JwtAuthGuard).
// ─────────────────────────────────────────────────────────────────────────────

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../interfaces';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly configService: ConfigService) {
        super({
            // Extract token from "Authorization: Bearer <token>" header
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

            // Reject expired tokens automatically
            ignoreExpiration: false,

            // Signing secret — must match the one used to sign tokens in AuthService
            secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
        });
    }

    /**
     * Called after token signature verification succeeds.
     * The returned object is attached to `request.user`.
     *
     * @param payload - Decoded JWT claims
     * @returns User context available in controllers via @Request()
     */
    validate(payload: JwtPayload): JwtPayload {
        if (!payload.sub || !payload.role) {
            throw new UnauthorizedException('Invalid token payload');
        }

        return {
            sub: payload.sub,
            username: payload.username,
            role: payload.role,
        };
    }
}
