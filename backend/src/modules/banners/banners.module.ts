import { Module } from '@nestjs/common'
import { BannersService } from './banners.service'
import { BannersController } from './banners.controller'
import { PrismaService } from '../../prisma.service'

@Module({
  controllers: [BannersController],
  providers: [BannersService, PrismaService],
})
export class BannersModule {}
