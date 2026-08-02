import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma.service'

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        coins: true,
        cashBalance: true,
        referralCode: true,
        createdAt: true,
      },
    })
  }
}
