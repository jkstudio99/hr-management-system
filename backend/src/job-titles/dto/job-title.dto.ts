// ─────────────────────────────────────────────────────────────────────────────
// JobTitles DTOs
// ─────────────────────────────────────────────────────────────────────────────

import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateJobTitleDto {
    @IsString()
    @IsNotEmpty({ message: 'Title name is required' })
    @MaxLength(100)
    readonly titleName: string;
}

export class UpdateJobTitleDto extends PartialType(CreateJobTitleDto) { }
