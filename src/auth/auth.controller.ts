// src/auth/auth.controller.ts
import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common'
import type { Request, Response } from 'express'
import { AuthService } from '#auth/auth.service.js'
import { LoginDto } from '#auth/dto/login.dto.js'
import { RefreshDto } from '#auth/dto/refresh.dto.js'
import { RegisterDto } from '#auth/dto/register.dto.js'
import { GoogleAuthGuard } from '#auth/guards/google-auth.guard.js'
import type { GoogleProfilePayload } from '#users/users.service.js'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto)
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto)
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshDto) {
    return this.authService.refreshTokens(dto.userId, dto.sessionId, dto.refreshToken)
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Body() dto: { sessionId: string }) {
    return this.authService.revokeSession(dto.sessionId)
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {
    // Initiates Google OAuth redirect flow automatically via Passport
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    const googleProfile = req.user as GoogleProfilePayload
    const { tokens } = await this.authService.validateGoogleLogin(googleProfile)

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'

    // HashMode-compatible redirect URL
    const redirectUrl = `${frontendUrl}/#/auth/callback?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}&sessionId=${tokens.sessionId}`

    return res.redirect(redirectUrl)
  }
}