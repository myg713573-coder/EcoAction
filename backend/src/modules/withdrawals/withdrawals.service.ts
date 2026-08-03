import { Injectable, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../../prisma.service'

@Injectable()
export class WithdrawalsService {
  constructor(private prisma: PrismaService) {}

  async requestWithdrawal(userId: string, amount: number, paymentMethod: string, paymentDetails: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { cashBalance: true } })

    if (!user) {
      throw new BadRequestException('User not found')
    }

    if (Number(user.cashBalance) < amount) {
      throw new BadRequestException('Insufficient balance')
    }

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
      include: { user: true },
    })
  }

  async reviewWithdrawal(withdrawalId: string, status: 'APPROVED' | 'REJECTED', adminNote?: string) {
    return this.prisma.withdrawal.update({
      where: { id: withdrawalId },
      data: { status, adminNote },
    })
  }
}
