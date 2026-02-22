// ─────────────────────────────────────────────────────────────────────────────
// AuthController — Authentication endpoints
// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/login     — Authenticate and receive JWT
// POST /api/auth/register  — Create new account and receive JWT
// GET  /api/auth/profile   — Get current user profile (requires JWT)
// ─────────────────────────────────────────────────────────────────────────────

import {
    Controller,
    Post,
    Get,
    Body,
    UseGuards,
    Request,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto';
import { JwtAuthGuard } from './guards';
import { JwtPayload } from './interfaces';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    /**
     * POST /api/auth/login
     * Authenticate with username + password, receive a JWT.
     *
     * Returns 200 (not 201) because login doesn't create a resource.
     */
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    /**
     * POST /api/auth/register
     * Create a new user account and receive a JWT.
     *
     * Returns 201 (Created) — default for @Post().
     */
    @Post('register')
    async register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    /**
     * GET /api/auth/profile
     * Fetch the authenticated user's profile.
     *
     * Protected by JWT — only accessible with a valid Bearer token.
     */
    @UseGuards(JwtAuthGuard)
    @Get('profile')
    async getProfile(@Request() req: { user: JwtPayload }) {
        return this.authService.getProfile(req.user);
    }
}
