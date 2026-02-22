// ─────────────────────────────────────────────────────────────────────────────
// Payroll DTOs
// ─────────────────────────────────────────────────────────────────────────────

import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsIn,
  IsNumber,
  Matches,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePayrollRunDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}$/, { message: 'Period must be in YYYY-MM format' })
  readonly period: string;
}

export class UpdatePayrollItemDto {
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  readonly allowances?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  readonly deductions?: number;
}

export class ProcessPayrollDto {
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  readonly ssoRate?: number; // default 5% capped at 750

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  readonly taxRate?: number; // simplified flat rate for demo
}

export class QueryPayrollDto {
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
  @IsIn(['DRAFT', 'PROCESSING', 'COMPLETED'])
  readonly status?: string;
}
