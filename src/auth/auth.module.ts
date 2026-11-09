// src/auth/auth.module.ts
import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { AuthController } from '#auth/auth.controller.js'
import { AuthService } from '#auth/auth.service.js'
import { GoogleStrategy } from '#auth/strategies/google.strategy.js'
import { UsersModule } from '#users/users.module.js'

@Module({
  imports: [
    PassportModule,
    JwtModule.register({}),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy],
})
export class AuthModule {}