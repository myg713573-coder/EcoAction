import { Body, Controller, Get, Post, Query } from '@nestjs/common'
import { AdminService } from './admin.service'

@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('stats')
  async stats() {
    return this.adminService.stats()
  }

  @Get('users')
  async users(@Query('search') search?: string) {
    return this.adminService.listUsers(search)
  }

  @Get('withdrawals')
  async withdrawals(@Query('status') status?: 'PENDING' | 'APPROVED' | 'REJECTED', @Query('search') search?: string) {
    return this.adminService.listWithdrawals(status, search)
  }

  @Get('tasks')
  async tasks() {
    return this.adminService.listTasks()
  }

  @Post('task')
  async createTask(
    @Body()
    body: {
      title: string
      description: string
      rewardAmount: number
      proofType: 'SCREENSHOT' | 'LINK' | 'TEXT' | 'VIDEO'
      maxParticipants: number
      status?: 'ACTIVE' | 'PAUSED' | 'COMPLETED'
    },
  ) {
    return this.adminService.createTask(body)
  }

  @Post('task/update')
  async updateTask(
    @Body()
    body: {
      id: string
      data: {
        title?: string
        description?: string
        rewardAmount?: number
        proofType?: 'SCREENSHOT' | 'LINK' | 'TEXT' | 'VIDEO'
        maxParticipants?: number
        status?: 'ACTIVE' | 'PAUSED' | 'COMPLETED'
      }
    },
  ) {
    return this.adminService.updateTask(body.id, body.data)
  }

  @Get('task-submissions')
  async taskSubmissions() {
    return this.adminService.listPendingSubmissions()
  }

  @Post('task-submission/review')
  async reviewTaskSubmission(@Body() body: { submissionId: string; status: 'APPROVED' | 'REJECTED'; adminNote?: string }) {
    return this.adminService.reviewSubmission(body.submissionId, body.status, body.adminNote)
  }

  @Get('banners')
  async banners() {
    return this.adminService.listBanners()
  }

  @Post('banner')
  async createBanner(@Body() data: any) {
    return this.adminService.createBanner(data)
  }

  @Post('banner/update')
  async updateBanner(@Body() body: { id: string; data: any }) {
    return this.adminService.updateBanner(body.id, body.data)
  }

  @Post('withdrawal/review')
  async reviewWithdrawal(@Body() body: { withdrawalId: string; status: 'APPROVED' | 'REJECTED'; adminNote?: string }) {
    return this.adminService.reviewWithdrawal(body.withdrawalId, body.status, body.adminNote)
  }

  @Post('user/role')
  async setUserRole(@Body() body: { userId: string; role: 'USER' | 'ADMIN' | 'MODERATOR' }) {
    return this.adminService.setUserRole(body.userId, body.role)
  }

  @Post('user/balance')
  async adjustUserBalance(@Body() body: { userId: string; coins: number; cashBalance: number }) {
    return this.adminService.adjustUserBalance(body.userId, body.coins, body.cashBalance)
  }
}
