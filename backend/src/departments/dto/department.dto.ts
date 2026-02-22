// ─────────────────────────────────────────────────────────────────────────────
// Departments DTOs
// ─────────────────────────────────────────────────────────────────────────────

import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateDepartmentDto {
    @IsString()
    @IsNotEmpty({ message: 'Department name is required' })
    @MaxLength(100)
    readonly departmentName: string;
}

export class UpdateDepartmentDto extends PartialType(CreateDepartmentDto) { }
