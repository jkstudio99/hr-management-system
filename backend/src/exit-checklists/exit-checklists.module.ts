import { Module } from '@nestjs/common';
import { ExitChecklistsService } from './exit-checklists.service';
import { ExitChecklistsController } from './exit-checklists.controller';

@Module({
    controllers: [ExitChecklistsController],
    providers: [ExitChecklistsService],
    exports: [ExitChecklistsService],
})
export class ExitChecklistsModule { }
