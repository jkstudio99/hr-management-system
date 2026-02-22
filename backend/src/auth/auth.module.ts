// ─────────────────────────────────────────────────────────────────────────────
// AuthModule — Authentication & Authorization module
// ─────────────────────────────────────────────────────────────────────────────
// Registers:
//   • JwtModule        — for token signing/verification
//   • PassportModule   — for Passport strategy integration
//   • JwtStrategy      — Bearer token validation strategy
//   • AuthService      — business logic (login, register)
//   • AuthController   — HTTP endpoints
//
// Exports JwtAuthGuard and RolesGuard for use in other modules.
// ─────────────────────────────────────────────────────────────────────────────

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies';

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),

        // ── JWT Configuration ─────────────────────────────────────────────
        // Uses ConfigService to read secret and expiration from .env.
        // This keeps secrets out of source code.
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.getOrThrow<string>('JWT_SECRET'),
                signOptions: {
                    expiresIn: configService.get<string>('JWT_EXPIRATION', '1d') as any,
                },
            }),
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy],
    exports: [AuthService, JwtModule, PassportModule],
})
export class AuthModule { }
