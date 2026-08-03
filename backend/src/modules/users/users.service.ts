import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma.service'

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findProfile(userId: string) {
    const [profile, referralCount, pendingWithdrawals, approvedWithdrawals, taskSubmissions] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          coins: true,
          cashBalance: true,
          referralCode: true,
          referredBy: true,
          createdAt: true,
        },
      }),
      this.prisma.referral.count({ where: { userId } }),
      this.prisma.withdrawal.count({ where: { userId, status: 'PENDING' } }),
      this.prisma.withdrawal.count({ where: { userId, status: 'APPROVED' } }),
      this.prisma.taskSubmission.count({ where: { userId } }),
    ])

    return {
      ...profile,
      referralCount,
      pendingWithdrawals,
      approvedWithdrawals,
      taskSubmissions,
    }
  }

  async listReferrals(userId: string) {
    return this.prisma.referral.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        createdAt: true,
        referred: {
          select: {
            id: true,
            username: true,
            email: true,
            createdAt: true,
          },
        },
      },
    })
  }

  async listUserActivity(userId: string) {
    const [submissions, withdrawals, referrals] = await Promise.all([
      this.prisma.taskSubmission.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          status: true,
          createdAt: true,
          task: { select: { title: true } },
        },
      }),
      this.prisma.withdrawal.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          status: true,
          amount: true,
          createdAt: true,
        },
      }),
      this.prisma.referral.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          createdAt: true,
          referred: { select: { username: true } },
        },
      }),
    ])

    return {
      submissions,
      withdrawals,
      referrals,
    }
  }
}
