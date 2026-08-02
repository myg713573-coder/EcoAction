import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma.service'

@Injectable()
export class WithdrawalsService {
  constructor(private prisma: PrismaService) {}

  async requestWithdrawal(userId: string, amount: number, paymentMethod: string, paymentDetails: string) {
    return this.prisma.withdrawal.create({
      data: {
        userId,
        amount: BigInt(amount),
        paymentMethod,
        paymentDetails,
      },
    })
  }

  async listPending() {
    return this.prisma.withdrawal.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
    })
  }

  async reviewWithdrawal(withdrawalId: string, status: 'APPROVED' | 'REJECTED', adminNote?: string) {
    return this.prisma.withdrawal.update({
      where: { id: withdrawalId },
      data: { status, adminNote },
    })
  }
}
