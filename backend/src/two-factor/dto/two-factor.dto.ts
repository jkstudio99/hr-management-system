// ─────────────────────────────────────────────────────────────────────────────
// Two-Factor DTOs
// ─────────────────────────────────────────────────────────────────────────────

import { IsString, IsNotEmpty, Length } from 'class-validator';

export class TwoFactorCodeDto {
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'Code must be exactly 6 digits' })
  readonly code: string;
}
