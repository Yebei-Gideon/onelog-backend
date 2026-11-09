// src/users/users.service.ts
import { Injectable } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import { DatabaseService } from '#database/database.service.js'
import { users, type NewUser, type User } from '#database/schema.js'

export interface GoogleProfilePayload {
  googleId: string
  email: string
  name: string
  avatarUrl?: string
}

@Injectable()
export class UsersService {
  constructor(private readonly dbService: DatabaseService) { }

  async findById(id: string): Promise<User | null> {
    const [user] = await this.dbService.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1)
    return user || null
  }

  async findByEmail(email: string): Promise<User | null> {
    const [user] = await this.dbService.db
      .select()
      .from(users)
      .where(eq(users.email, email.trim().toLowerCase()))
      .limit(1)
    return user || null
  }

  async createEmailUser(name: string, email: string, passwordHash: string): Promise<User> {
    const newUser: NewUser = {
      name,
      email: email.toLowerCase().trim(),
      passwordHash,
    }

    const [createdUser] = await this.dbService.db
      .insert(users)
      .values(newUser)
      .returning()

    return createdUser
  }

  async findOrCreateGoogleUser(profile: GoogleProfilePayload): Promise<User> {
    const [existingGoogleUser] = await this.dbService.db
      .select()
      .from(users)
      .where(eq(users.googleId, profile.googleId))
      .limit(1)

    if (existingGoogleUser) {
      return existingGoogleUser
    }

    const email = profile.email.trim().toLowerCase()
    const existingEmailUser = await this.findByEmail(email)

    if (existingEmailUser) {
      const [updatedUser] = await this.dbService.db
        .update(users)
        .set({ googleId: profile.googleId, avatarUrl: profile.avatarUrl })
        .where(eq(users.id, existingEmailUser.id))
        .returning()
      return updatedUser
    }

    const newUser: NewUser = {
      email,
      name: profile.name,
      avatarUrl: profile.avatarUrl,
      googleId: profile.googleId,
    }

    const [createdUser] = await this.dbService.db
      .insert(users)
      .values(newUser)
      .returning()

    return createdUser
  }
}