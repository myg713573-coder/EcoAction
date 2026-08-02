import { Body, Controller, Post } from '@nestjs/common'
import { WithdrawalsService } from './withdrawals.service'

@Controller('withdrawals')
export class WithdrawalsController {
  constructor(private withdrawalsService: WithdrawalsService) {}

  @Post('request')
  async request(@Body() body: { userId: string; amount: number; paymentMethod: string; paymentDetails: string }) {
    return this.withdrawalsService.requestWithdrawal(body.userId, body.amount, body.paymentMethod, body.paymentDetails)
  }
}
