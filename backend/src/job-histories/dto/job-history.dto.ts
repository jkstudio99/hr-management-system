// JobHistories DTOs — Matches Prisma schema: oldTitleId, newTitleId, effectiveDate

import { IsInt, IsPositive, IsDateString, IsOptional, Min } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';

export class CreateJobHistoryDto {
    @IsInt() @IsPositive()
    readonly employeeId: number;

    @IsInt() @IsPositive()
    readonly oldTitleId: number;

    @IsInt() @IsPositive()
    readonly newTitleId: number;

    @IsDateString()
    readonly effectiveDate: string;
}

export class UpdateJobHistoryDto extends PartialType(CreateJobHistoryDto) { }

export class QueryJobHistoryDto {
    @IsOptional() @Type(() => Number) @IsInt() @Min(1)
    readonly page?: number = 1;

    @IsOptional() @Type(() => Number) @IsInt() @Min(1)
    readonly limit?: number = 20;

    @IsOptional() @Type(() => Number) @IsInt()
    readonly employeeId?: number;
}
