import { Controller, Get, Query } from '@nestjs/common'
import { UsersService } from './users.service'

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  async profile(@Query('userId') userId: string) {
    return this.usersService.findProfile(userId)
  }

  @Get('referrals')
  async referrals(@Query('userId') userId: string) {
    return this.usersService.listReferrals(userId)
  }
}
