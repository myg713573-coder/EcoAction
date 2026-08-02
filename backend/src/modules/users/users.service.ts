import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma.service'

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findProfile(userId: string) {
    const [profile, referralCount] = await Promise.all([
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
    ])

    return {
      ...profile,
      referralCount,
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
}
