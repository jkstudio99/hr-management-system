// ─────────────────────────────────────────────────────────────────────────────
// Assets DTOs
// ─────────────────────────────────────────────────────────────────────────────

import {
    IsString,
    IsNotEmpty,
    IsInt,
    IsPositive,
    IsOptional,
    IsIn,
    MaxLength,
    Min,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';

export class CreateAssetDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    readonly assetName: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    readonly serialNumber: string;

    @IsOptional()
    @IsInt()
    @IsPositive()
    readonly employeeId?: number;

    @IsOptional()
    @IsString()
    @IsIn(['AVAILABLE', 'ASSIGNED', 'RETIRED', 'MAINTENANCE'])
    readonly status?: string;
}

export class UpdateAssetDto extends PartialType(CreateAssetDto) { }

export class QueryAssetDto {
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
    @IsString()
    @IsIn(['AVAILABLE', 'ASSIGNED', 'RETIRED', 'MAINTENANCE'])
    readonly status?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    readonly employeeId?: number;
}
