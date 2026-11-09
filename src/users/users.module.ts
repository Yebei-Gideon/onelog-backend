import { Module } from '@nestjs/common'
import { UsersService } from '#users/users.service.js'
import { JwtStrategy } from '#auth/strategies/jwt.strategy.js'
import { UsersController } from './users.controller.js'

@Module({
  providers: [UsersService, JwtStrategy],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}