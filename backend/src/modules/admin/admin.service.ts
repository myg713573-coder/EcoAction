import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma.service'

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async stats() {
    const [users, tasks, pendingSubmissions, pendingWithdrawals, banners, approvedWithdrawals, totalCoins, totalCash] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.task.count(),
      this.prisma.taskSubmission.count({ where: { status: 'PENDING' } }),
      this.prisma.withdrawal.count({ where: { status: 'PENDING' } }),
      this.prisma.banner.count({ where: { isActive: true } }),
      this.prisma.withdrawal.count({ where: { status: 'APPROVED' } }),
      this.prisma.user.aggregate({ _sum: { coins: true } }),
      this.prisma.user.aggregate({ _sum: { cashBalance: true } }),
    ])

    return {
      users,
      tasks,
      pendingSubmissions,
      pendingWithdrawals,
      banners,
      approvedWithdrawals,
      totalCoins: totalCoins._sum.coins?.toString() ?? '0',
      totalCash: totalCash._sum.cashBalance?.toString() ?? '0',
    }
  }

  async listTasks() {
    return this.prisma.task.findMany({
      orderBy: { createdAt: 'desc' },
    })
  }

  async createTask(data: {
    title: string
    description: string
    rewardAmount: number
    proofType: 'SCREENSHOT' | 'LINK' | 'TEXT' | 'VIDEO'
    maxParticipants: number
    status?: 'ACTIVE' | 'PAUSED' | 'COMPLETED'
  }) {
    return this.prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        rewardAmount: BigInt(data.rewardAmount),
        proofType: data.proofType,
        maxParticipants: data.maxParticipants,
        status: data.status ?? 'ACTIVE',
      },
    })
  }

  async updateTask(id: string, data: {
    title?: string
    description?: string
    rewardAmount?: number
    proofType?: 'SCREENSHOT' | 'LINK' | 'TEXT' | 'VIDEO'
    maxParticipants?: number
    status?: 'ACTIVE' | 'PAUSED' | 'COMPLETED'
  }) {
    return this.prisma.task.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        rewardAmount: data.rewardAmount !== undefined ? BigInt(data.rewardAmount) : undefined,
        proofType: data.proofType,
        maxParticipants: data.maxParticipants,
        status: data.status,
      },
    })
  }

  async listPendingSubmissions() {
    return this.prisma.taskSubmission.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      include: { user: true, task: true },
    })
  }

  async reviewSubmission(submissionId: string, status: 'APPROVED' | 'REJECTED', adminNote?: string) {
    const submission = await this.prisma.taskSubmission.findUnique({
      where: { id: submissionId },
      include: { task: true },
    })

    if (!submission) {
      throw new NotFoundException('Submission not found')
    }

    const updatedSubmission = await this.prisma.taskSubmission.update({
      where: { id: submissionId },
      data: { status, adminNote },
    })

    if (status === 'APPROVED') {
      await this.prisma.user.update({
        where: { id: submission.userId },
        data: { coins: { increment: submission.task.rewardAmount } },
      })
    }

    return updatedSubmission
  }

  async listBanners() {
    return this.prisma.banner.findMany({ orderBy: { priority: 'desc' } })
  }

  async updateBanner(id: string, data: { title?: string; description?: string; buttonText?: string; link?: string; background?: string; priority?: number; isActive?: boolean; startDate?: string; endDate?: string }) {
    return this.prisma.banner.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        buttonText: data.buttonText,
        link: data.link,
        background: data.background,
        priority: data.priority,
        isActive: data.isActive,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
    })
  }

  async createBanner(data: { title: string; description: string; buttonText: string; link: string; background?: string; priority?: number; isActive?: boolean; startDate?: string; endDate?: string }) {
    return this.prisma.banner.create({
      data: {
        title: data.title,
        description: data.description,
        buttonText: data.buttonText,
        link: data.link,
        background: data.background ?? '#0f172a',
        priority: data.priority ?? 0,
        isActive: data.isActive ?? true,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
    })
  }

  async listUsers(search?: string) {
    const where = search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' as const } },
            { username: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : undefined

    return this.prisma.user.findMany({
      where,
      select: { id: true, email: true, username: true, role: true, coins: true, cashBalance: true, referralCode: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  async listWithdrawals(status?: 'PENDING' | 'APPROVED' | 'REJECTED', search?: string) {
    const where = {
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { paymentMethod: { contains: search, mode: 'insensitive' as const } },
              { paymentDetails: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    }

    return this.prisma.withdrawal.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    })
  }

  async reviewWithdrawal(withdrawalId: string, status: 'APPROVED' | 'REJECTED', adminNote?: string) {
    const withdrawal = await this.prisma.withdrawal.update({
      where: { id: withdrawalId },
      data: { status, adminNote },
    })

    if (status === 'APPROVED') {
      const amount = Number(withdrawal.amount)
      await this.prisma.user.update({
        where: { id: withdrawal.userId },
        data: { cashBalance: { decrement: BigInt(amount) } },
      })
    }

    return withdrawal
  }

  async setUserRole(userId: string, role: 'USER' | 'ADMIN' | 'MODERATOR') {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
    })
  }

  async adjustUserBalance(userId: string, coins: number, cashBalance: number) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        coins: BigInt(coins),
        cashBalance: BigInt(cashBalance),
      },
    })
  }
}
