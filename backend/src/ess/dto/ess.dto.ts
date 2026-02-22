// ─────────────────────────────────────────────────────────────────────────────
// ESS DTOs — Employee Self-Service
// ─────────────────────────────────────────────────────────────────────────────

import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsIn,
  IsDateString,
  IsPositive,
  IsInt,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class EssSubmitLeaveDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['ANNUAL', 'SICK', 'PERSONAL', 'MATERNITY', 'OTHER'])
  readonly leaveType: string;

  @IsDateString()
  readonly startDate: string;

  @IsDateString()
  readonly endDate: string;
}

export class EssSubmitExpenseDto {
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

export class EssPaginationDto {
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
}
