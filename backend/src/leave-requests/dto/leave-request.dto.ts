// ─────────────────────────────────────────────────────────────────────────────
// LeaveRequests DTOs
// ─────────────────────────────────────────────────────────────────────────────

import {
    IsString,
    IsNotEmpty,
    IsInt,
    IsPositive,
    IsDateString,
    IsOptional,
    IsIn,
    Min,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';

export class CreateLeaveRequestDto {
    @IsInt()
    @IsPositive()
    readonly employeeId: number;

    @IsString()
    @IsNotEmpty()
    @IsIn(['ANNUAL', 'SICK', 'PERSONAL', 'MATERNITY', 'OTHER'], {
        message: 'leaveType must be one of: ANNUAL, SICK, PERSONAL, MATERNITY, OTHER',
    })
    readonly leaveType: string;

    @IsDateString({}, { message: 'startDate must be a valid ISO date' })
    readonly startDate: string;

    @IsDateString({}, { message: 'endDate must be a valid ISO date' })
    readonly endDate: string;
}

export class UpdateLeaveRequestDto extends PartialType(CreateLeaveRequestDto) {
    @IsOptional()
    @IsString()
    @IsIn(['PENDING', 'APPROVED', 'REJECTED'])
    readonly status?: string;

    @IsOptional()
    @IsInt()
    @IsPositive()
    readonly approverId?: number;
}

export class QueryLeaveRequestDto {
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
    readonly leaveType?: string;
}
