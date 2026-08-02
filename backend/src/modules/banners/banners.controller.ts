import { Controller, Get } from '@nestjs/common'
import { BannersService } from './banners.service'

@Controller('banners')
export class BannersController {
  constructor(private bannersService: BannersService) {}

  @Get('active')
  async active() {
    return this.bannersService.listActive()
  }
}
