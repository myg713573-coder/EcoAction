import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './modules/auth/auth.module'
import { UsersModule } from './modules/users/users.module'
import { TasksModule } from './modules/tasks/tasks.module'
import { BannersModule } from './modules/banners/banners.module'
import { WithdrawalsModule } from './modules/withdrawals/withdrawals.module'
import { AdminModule } from './modules/admin/admin.module'
import { AdminMiddleware } from './middleware/admin.middleware'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UsersModule,
    TasksModule,
    BannersModule,
    WithdrawalsModule,
    AdminModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AdminMiddleware).forRoutes('admin')
  }
}
