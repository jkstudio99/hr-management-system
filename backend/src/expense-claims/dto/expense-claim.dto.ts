// ─────────────────────────────────────────────────────────────────────────────
// Expense Claims DTOs
// ─────────────────────────────────────────────────────────────────────────────

import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsPositive,
  IsOptional,
  IsIn,
  IsNumber,
  MaxLength,
  Min,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';

export class CreateExpenseClaimDto {
  @IsInt()
  @IsPositive()
  readonly employeeId: number;

  @IsString()
  @IsNotEmpty()
  @IsIn(['MEDICAL', 'TRAVEL', 'EQUIPMENT', 'TRAINING', 'MEAL', 'OTHER'])
  readonly claimType: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive({ message: 'Amount must be greater than zero' })
  readonly amount: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  readonly receiptUrl?: string;
}

export class UpdateExpenseClaimDto extends PartialType(CreateExpenseClaimDto) {
  @IsOptional()
  @IsString()
  @IsIn(['PENDING', 'APPROVED', 'REJECTED'])
  readonly status?: string;
}

export class QueryExpenseClaimDto {
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
  readonly employeeId?: number;

  @IsOptional()
  @IsString()
  @IsIn(['PENDING', 'APPROVED', 'REJECTED'])
  readonly status?: string;

  @IsOptional()
  @IsString()
  @IsIn(['MEDICAL', 'TRAVEL', 'EQUIPMENT', 'TRAINING', 'MEAL', 'OTHER'])
  readonly claimType?: string;
}
