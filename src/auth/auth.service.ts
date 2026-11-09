// src/auth/auth.service.ts
import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { and, eq } from 'drizzle-orm'
import { DatabaseService } from '#database/database.service.js'
import { refreshSessions, type User } from '#database/schema.js'
import { UsersService, type GoogleProfilePayload } from '#users/users.service.js'
import type { LoginDto } from './dto/login.dto.js'
import type { RegisterDto } from './dto/register.dto.js'

export interface TokenPair {
  accessToken: string
  refreshToken: string
  sessionId: string
}

export interface AuthResponse {
  user: Omit<User, 'passwordHash'>
  tokens: TokenPair
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly dbService: DatabaseService,
  ) { }

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existingUser = await this.usersService.findByEmail(dto.email)
    if (existingUser) {
      throw new ConflictException('An account with this email address already exists')
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(dto.password, saltRounds)

    const user = await this.usersService.createEmailUser(dto.name, dto.email, passwordHash)
    const tokens = await this.generateTokens(user.id, user.email)

    const { passwordHash: _, ...safeUser } = user
    return { user: safeUser, tokens }
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.usersService.findByEmail(dto.email)
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password')
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash)
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password')
    }

    const tokens = await this.generateTokens(user.id, user.email, dto.rememberMe)

    const { passwordHash: _, ...safeUser } = user
    return { user: safeUser, tokens }
  }

  async validateGoogleLogin(googleProfile: GoogleProfilePayload): Promise<AuthResponse> {
    const user = await this.usersService.findOrCreateGoogleUser(googleProfile)
    const tokens = await this.generateTokens(user.id, user.email)

    const { passwordHash: _, ...safeUser } = user
    return { user: safeUser, tokens }
  }

  async generateTokens(userId: string, email: string, rememberMe = false): Promise<TokenPair> {
    const payload = { sub: userId, email }

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret',
      expiresIn: '15m',
    })

    const sessionId = crypto.randomUUID()
    const expiresInDays = rememberMe ? 30 : 7

    const refreshToken = await this.jwtService.signAsync(
      { sub: userId, sessionId },
      {
        secret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
        expiresIn: `${expiresInDays}d`,
      },
    )

    const tokenHash = await bcrypt.hash(refreshToken, 10)
    const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)

    await this.dbService.db.insert(refreshSessions).values({
      id: sessionId,
      userId,
      tokenHash,
      expiresAt,
    })

    return { accessToken, refreshToken, sessionId }
  }

  async refreshTokens(userId: string, sessionId: string, incomingRefreshToken: string): Promise<TokenPair> {
    const [session] = await this.dbService.db
      .select()
      .from(refreshSessions)
      .where(and(eq(refreshSessions.id, sessionId), eq(refreshSessions.isRevoked, false)))
      .limit(1)

    if (!session || new Date() > session.expiresAt) {
      throw new UnauthorizedException('Invalid or expired refresh session')
    }

    const isMatch = await bcrypt.compare(incomingRefreshToken, session.tokenHash)
    if (!isMatch) {
      // Token reuse attack detection — revoke entire session
      await this.dbService.db
        .update(refreshSessions)
        .set({ isRevoked: true })
        .where(eq(refreshSessions.id, sessionId))
      throw new UnauthorizedException('Security breach detected. Session revoked.')
    }

    // Revoke old session token (Rotation)
    await this.dbService.db
      .update(refreshSessions)
      .set({ isRevoked: true })
      .where(eq(refreshSessions.id, sessionId))

    const user = await this.usersService.findById(userId)
    if (!user) throw new UnauthorizedException('User not found')

    return this.generateTokens(user.id, user.email)
  }

  async revokeSession(sessionId: string): Promise<{ success: boolean }> {
    await this.dbService.db
      .update(refreshSessions)
      .set({ isRevoked: true })
      .where(eq(refreshSessions.id, sessionId))
    return { success: true }
  }
}