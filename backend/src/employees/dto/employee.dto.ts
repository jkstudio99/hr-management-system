// ─────────────────────────────────────────────────────────────────────────────
// Employees DTOs — Input validation for employee operations
// ─────────────────────────────────────────────────────────────────────────────

import {
    IsString,
    IsNotEmpty,
    IsInt,
    IsPositive,
    IsDateString,
    IsNumber,
    IsBoolean,
    IsOptional,
    MaxLength,
    Min,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';

/**
 * DTO for creating a new employee record.
 * All fields are required — matches the Prisma schema constraints.
 */
export class CreateEmployeeDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(20, { message: 'ID card number must not exceed 20 characters' })
    readonly idCard: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    readonly firstName: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    readonly lastName: string;

    @IsInt()
    @IsPositive()
    readonly departmentId: number;

    @IsInt()
    @IsPositive()
    readonly jobTitleId: number;

    @IsDateString({}, { message: 'hireDate must be a valid ISO date string' })
    readonly hireDate: string;

    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0, { message: 'Base salary cannot be negative' })
    readonly baseSalary: number;
}

export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {
    @IsOptional()
    @IsBoolean()
    readonly isActive?: boolean;
}

/**
 * Query parameters for listing employees with pagination & search.
 */
export class QueryEmployeeDto {
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
    readonly search?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    readonly departmentId?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    readonly jobTitleId?: number;

    @IsOptional()
    @IsString()
    readonly isActive?: string;
}
