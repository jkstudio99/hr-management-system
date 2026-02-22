import { Module } from '@nestjs/common';
import { ExpenseClaimsService } from './expense-claims.service';
import { ExpenseClaimsController } from './expense-claims.controller';

@Module({
  controllers: [ExpenseClaimsController],
  providers: [ExpenseClaimsService],
  exports: [ExpenseClaimsService],
})
export class ExpenseClaimsModule {}
