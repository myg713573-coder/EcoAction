import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma.service'

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async listTasks() {
    return this.prisma.task.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
    })
  }

  async submitTask(userId: string, taskId: string, proof: string) {
    return this.prisma.taskSubmission.create({
      data: {
        userId,
        taskId,
        proof,
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

    const updated = await this.prisma.taskSubmission.update({
      where: { id: submissionId },
      data: {
        status,
        adminNote,
      },
    })

    if (status === 'APPROVED') {
      await this.prisma.user.update({
        where: { id: submission.userId },
        data: { coins: { increment: submission.task.rewardAmount } },
      })
    }

    return updated
  }
}
