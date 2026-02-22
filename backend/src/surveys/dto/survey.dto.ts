// ─────────────────────────────────────────────────────────────────────────────
// Surveys DTOs
// ─────────────────────────────────────────────────────────────────────────────

import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsIn,
  IsDateString,
  IsArray,
  ValidateNested,
  IsBoolean,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSurveyQuestionDto {
  @IsString()
  @IsNotEmpty()
  readonly question: string;

  @IsOptional()
  @IsString()
  @IsIn(['RATING', 'TEXT', 'MULTIPLE_CHOICE'])
  readonly type?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  readonly sortOrder?: number;
}

export class CreateSurveyDto {
  @IsString()
  @IsNotEmpty()
  readonly title: string;

  @IsDateString()
  readonly startDate: string;

  @IsDateString()
  readonly endDate: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSurveyQuestionDto)
  readonly questions: CreateSurveyQuestionDto[];
}

export class UpdateSurveyDto {
  @IsOptional()
  @IsString()
  readonly title?: string;

  @IsOptional()
  @IsBoolean()
  readonly isActive?: boolean;

  @IsOptional()
  @IsDateString()
  readonly startDate?: string;

  @IsOptional()
  @IsDateString()
  readonly endDate?: string;
}

export class SubmitResponseDto {
  @IsString()
  @IsNotEmpty()
  readonly answer: string;
}

export class SubmitSurveyDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubmitAnswerDto)
  readonly answers: SubmitAnswerDto[];
}

export class SubmitAnswerDto {
  @IsInt()
  readonly questionId: number;

  @IsString()
  @IsNotEmpty()
  readonly answer: string;
}

export class QuerySurveyDto {
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
  readonly isActive?: string;
}
