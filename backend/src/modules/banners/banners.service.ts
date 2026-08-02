import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma.service'

@Injectable()
export class BannersService {
  constructor(private prisma: PrismaService) {}

  async listActive() {
    const now = new Date()
    return this.prisma.banner.findMany({
      where: {
        isActive: true,
        AND: [
          { OR: [{ startDate: null }, { startDate: { lte: now } }] },
          { OR: [{ endDate: null }, { endDate: { gte: now } }] },
        ],
      },
      orderBy: { priority: 'desc' },
    })
  }
}
