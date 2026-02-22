import { Module } from '@nestjs/common';
import { EssService } from './ess.service';
import { EssController } from './ess.controller';

@Module({
  controllers: [EssController],
  providers: [EssService],
  exports: [EssService],
})
export class EssModule {}
