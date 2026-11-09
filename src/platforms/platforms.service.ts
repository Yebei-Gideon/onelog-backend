// src/platforms/platforms.service.ts
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { and, eq, ilike, isNull, or } from 'drizzle-orm'
import { DatabaseService } from '#database/database.service.js'
import { platformCategories, platformStatuses, platforms } from '#database/schema.js'
import type { CreatePlatformDto } from '#platforms/dto/create-platform.dto.js'
import type { QueryPlatformDto } from '#platforms/dto/query-platform.dto.js'
import type { UpdatePlatformDto } from '#platforms/dto/update-platform.dto.js'

@Injectable()
export class PlatformsService {
  constructor(private readonly dbService: DatabaseService) { }

  async findAll(query: QueryPlatformDto, currentUserId?: string) {
    const conditions = []

    // Return global platforms OR custom platforms owned by current authenticated user
    if (currentUserId) {
      conditions.push(
        or(
          isNull(platforms.userId),
          eq(platforms.userId, currentUserId),
        ),
      )
    }
    else {
      conditions.push(isNull(platforms.userId))
    }

    if (query.category && query.category !== 'all') {
      conditions.push(eq(platformCategories.slug, query.category))
    }

    if (query.status && query.status !== 'all') {
      conditions.push(eq(platformStatuses.slug, query.status))
    }

    if (query.isFeatured !== undefined) {
      conditions.push(eq(platforms.isFeatured, query.isFeatured))
    }

    if (query.search) {
      conditions.push(
        or(
          ilike(platforms.name, `%${query.search}%`),
          ilike(platforms.description, `%${query.search}%`),
        ),
      )
    }

    const rows = await this.dbService.db
      .select({
        id: platforms.id,
        name: platforms.name,
        slug: platforms.slug,
        logo: platforms.logo,
        description: platforms.description,
        url: platforms.url,
        color: platforms.color,
        badge: platforms.badge,
        monthlyUsers: platforms.monthlyUsers,
        isFeatured: platforms.isFeatured,
        isCustom: platforms.isCustom,
        userId: platforms.userId,
        tags: platforms.tags,
        createdAt: platforms.createdAt,
        updatedAt: platforms.updatedAt,
        category: {
          id: platformCategories.id,
          name: platformCategories.name,
          slug: platformCategories.slug,
          description: platformCategories.description,
          icon: platformCategories.icon,
          color: platformCategories.color,
        },
        status: {
          id: platformStatuses.id,
          name: platformStatuses.name,
          slug: platformStatuses.slug,
          description: platformStatuses.description,
          color: platformStatuses.color,
        },
      })
      .from(platforms)
      .innerJoin(platformCategories, eq(platforms.categoryId, platformCategories.id))
      .leftJoin(platformStatuses, eq(platforms.statusId, platformStatuses.id))
      .where(conditions.length ? and(...conditions) : undefined)

    return rows
  }

  async findOne(id: string, currentUserId?: string) {
    const [platform] = await this.dbService.db
      .select({
        id: platforms.id,
        name: platforms.name,
        slug: platforms.slug,
        logo: platforms.logo,
        description: platforms.description,
        url: platforms.url,
        color: platforms.color,
        badge: platforms.badge,
        monthlyUsers: platforms.monthlyUsers,
        isFeatured: platforms.isFeatured,
        isCustom: platforms.isCustom,
        userId: platforms.userId,
        tags: platforms.tags,
        category: {
          id: platformCategories.id,
          name: platformCategories.name,
          slug: platformCategories.slug,
          description: platformCategories.description,
          icon: platformCategories.icon,
          color: platformCategories.color,
        },
        status: {
          id: platformStatuses.id,
          name: platformStatuses.name,
          slug: platformStatuses.slug,
          description: platformStatuses.description,
          color: platformStatuses.color,
        },
      })
      .from(platforms)
      .innerJoin(platformCategories, eq(platforms.categoryId, platformCategories.id))
      .leftJoin(platformStatuses, eq(platforms.statusId, platformStatuses.id))
      .where(eq(platforms.id, id))
      .limit(1)

    if (!platform) {
      throw new NotFoundException(`Platform with ID "${id}" not found`)
    }

    if (platform.isCustom && platform.userId !== currentUserId) {
      throw new UnauthorizedException('You do not have permission to view this platform')
    }

    return platform
  }

  async create(dto: CreatePlatformDto, currentUserId: string) {
    const slug = dto.slug || dto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')

    const [created] = await this.dbService.db
      .insert(platforms)
      .values({
        ...dto,
        slug,
        logo: dto.logo || 'i-lucide-globe',
        description: dto.description || '',
        color: dto.color || '#3B82F6',
        isCustom: true,
        userId: currentUserId,
      })
      .returning()

    return this.findOne(created.id, currentUserId)
  }

  async update(id: string, dto: UpdatePlatformDto, currentUserId: string) {
    const existing = await this.findOne(id, currentUserId)

    if (existing.isCustom && existing.userId !== currentUserId) {
      throw new UnauthorizedException('You can only modify your own custom platforms')
    }

    await this.dbService.db
      .update(platforms)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(platforms.id, id))

    return this.findOne(id, currentUserId)
  }

  async remove(id: string, currentUserId: string) {
    const existing = await this.findOne(id, currentUserId)

    if (existing.isCustom && existing.userId !== currentUserId) {
      throw new UnauthorizedException('You can only delete your own custom platforms')
    }

    await this.dbService.db.delete(platforms).where(eq(platforms.id, id))
    return { success: true, id }
  }
}