import {
    Controller, Get, Post, Patch, Delete,
    Body, Param, Query, ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AssetsService } from './assets.service';
import { CreateAssetDto, UpdateAssetDto, QueryAssetDto } from './dto';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth';

@ApiTags('assets')
@ApiBearerAuth('JWT-Auth')
@Controller('assets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AssetsController {
    constructor(private readonly assetsService: AssetsService) { }

    @Post()
    @Roles('ADMIN', 'HR')
    create(@Body() dto: CreateAssetDto) {
        return this.assetsService.create(dto);
    }

    @Get()
    findAll(@Query() query: QueryAssetDto) {
        return this.assetsService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.assetsService.findOne(id);
    }

    @Patch(':id')
    @Roles('ADMIN', 'HR')
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAssetDto) {
        return this.assetsService.update(id, dto);
    }

    @Delete(':id')
    @Roles('ADMIN')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.assetsService.remove(id);
    }
}
