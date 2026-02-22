// PerformanceReviews DTOs

import {
  IsInt,
  IsPositive,
  IsString,
  IsNotEmpty,
  IsOptional,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';

export class CreatePerformanceReviewDto {
  @IsInt()
  @IsPositive()
  readonly reviewerId: number;

  @IsInt()
  @IsPositive()
  readonly revieweeId: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  readonly period: string; // e.g. "2025-H2", "2025-Q4"

  @IsInt()
  @Min(1)
  @Max(10)
  readonly score: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  readonly comments?: string;
}

export class UpdatePerformanceReviewDto extends PartialType(
  CreatePerformanceReviewDto,
) {}

export class QueryPerformanceReviewDto {
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
  @Type(() => Number)
  @IsInt()
  readonly revieweeId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  readonly reviewerId?: number;

  @IsOptional()
  @IsString()
  readonly period?: string;
}
