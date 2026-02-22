// ─────────────────────────────────────────────────────────────────────────────
// Notifications DTOs
// ─────────────────────────────────────────────────────────────────────────────

import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsPositive,
  IsOptional,
  IsIn,
  IsBoolean,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateNotificationDto {
  @IsInt()
  @IsPositive()
  readonly userId: number;

  @IsString()
  @IsNotEmpty()
  readonly title: string;

  @IsString()
  @IsNotEmpty()
  readonly message: string;

  @IsOptional()
  @IsString()
  @IsIn(['INFO', 'WARNING', 'ALERT', 'SUCCESS'])
  readonly type?: string;
}

export class QueryNotificationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  readonly page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  readonly limit?: number = 20;

  @IsOptional()
  @IsString()
  @IsIn(['true', 'false'])
  readonly isRead?: string;
}

export class MarkReadDto {
  @IsBoolean()
  readonly isRead: boolean;
}
