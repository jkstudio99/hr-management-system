// ExitChecklists DTOs

import { IsInt, IsPositive, IsString, IsNotEmpty, IsOptional, IsBoolean, MaxLength, Min } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';

export class CreateExitChecklistDto {
    @IsInt() @IsPositive()
    readonly employeeId: number;

    @IsString() @IsNotEmpty() @MaxLength(200)
    readonly itemName: string;
}

export class UpdateExitChecklistDto extends PartialType(CreateExitChecklistDto) {
    @IsOptional() @IsBoolean()
    readonly isCompleted?: boolean;

    @IsOptional() @IsInt() @IsPositive()
    readonly clearedById?: number;
}

export class QueryExitChecklistDto {
    @IsOptional() @Type(() => Number) @IsInt() @Min(1)
    readonly page?: number = 1;

    @IsOptional() @Type(() => Number) @IsInt() @Min(1)
    readonly limit?: number = 50;

    @IsOptional() @Type(() => Number) @IsInt()
    readonly employeeId?: number;
}
