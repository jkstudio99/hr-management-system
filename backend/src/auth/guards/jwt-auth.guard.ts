// ─────────────────────────────────────────────────────────────────────────────
// JwtAuthGuard — Protects routes requiring authentication
// ─────────────────────────────────────────────────────────────────────────────
// Usage:  @UseGuards(JwtAuthGuard) on a controller or method.
// This is a thin wrapper over Passport's built-in AuthGuard('jwt').
// ─────────────────────────────────────────────────────────────────────────────

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') { }
