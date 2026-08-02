import { Body, Controller, Get, Post } from '@nestjs/common'
import { TasksService } from './tasks.service'

@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get()
  async list() {
    return this.tasksService.listTasks()
  }

  @Post('submit')
  async submit(@Body() body: { userId: string; taskId: string; proof: string }) {
    return this.tasksService.submitTask(body.userId, body.taskId, body.proof)
  }
}
