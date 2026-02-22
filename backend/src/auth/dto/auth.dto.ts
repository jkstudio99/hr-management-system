// ─────────────────────────────────────────────────────────────────────────────
// Auth DTOs — Data Transfer Objects for authentication
// ─────────────────────────────────────────────────────────────────────────────
// Strict input validation using class-validator.
// The ValidationPipe (configured in main.ts) rejects any request that
// doesn't conform to these shapes, preventing malformed or malicious data.
// ─────────────────────────────────────────────────────────────────────────────

import {
    IsString,
    IsEmail,
    MinLength,
    MaxLength,
    Matches,
    IsNotEmpty,
} from 'class-validator';

/**
 * POST /auth/login
 * Accepts username + password for credential verification.
 */
export class LoginDto {
    @IsString()
    @IsNotEmpty({ message: 'Username is required' })
    readonly username: string;

    @IsString()
    @IsNotEmpty({ message: 'Password is required' })
    readonly password: string;
}

/**
 * POST /auth/register
 * Creates a new user account with strict input validation.
 */
export class RegisterDto {
    @IsString()
    @IsNotEmpty({ message: 'Username is required' })
    @MinLength(3, { message: 'Username must be at least 3 characters' })
    @MaxLength(30, { message: 'Username must not exceed 30 characters' })
    @Matches(/^[a-zA-Z0-9_]+$/, {
        message: 'Username may only contain letters, numbers, and underscores',
    })
    readonly username: string;

    @IsString()
    @IsNotEmpty({ message: 'Password is required' })
    @MinLength(8, { message: 'Password must be at least 8 characters' })
    @MaxLength(128, { message: 'Password must not exceed 128 characters' })
    readonly password: string;

    @IsEmail({}, { message: 'A valid email address is required' })
    @IsNotEmpty({ message: 'Email is required' })
    readonly email: string;
}
