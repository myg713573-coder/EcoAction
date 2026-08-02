import { Module } from '@nestjs/common'
import { WithdrawalsService } from './withdrawals.service'
import { WithdrawalsController } from './withdrawals.controller'
import { PrismaService } from '../../prisma.service'

@Module({
  controllers: [WithdrawalsController],
  providers: [WithdrawalsService, PrismaService],
})
export class WithdrawalsModule {}
