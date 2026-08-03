import { Controller, Get } from '@nestjs/common'

@Controller()
export class AppController {
  @Get()
  getRoot() {
    return {
      status: 'ok',
      name: 'EcoAction API',
      timestamp: new Date().toISOString(),
    }
  }

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      service: 'ecoaction-backend',
      timestamp: new Date().toISOString(),
    }
  }
}
