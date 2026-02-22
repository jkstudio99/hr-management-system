import { Module } from '@nestjs/common';
import { JobHistoriesService } from './job-histories.service';
import { JobHistoriesController } from './job-histories.controller';

@Module({
    controllers: [JobHistoriesController],
    providers: [JobHistoriesService],
    exports: [JobHistoriesService],
})
export class JobHistoriesModule { }
