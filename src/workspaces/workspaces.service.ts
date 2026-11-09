import { Injectable, NotFoundException } from '@nestjs/common'
import { and, asc, eq } from 'drizzle-orm'
import { DatabaseService } from '#database/database.service.js'
import { platforms, workspacePlatforms, workspaces } from '#database/schema.js'
import type { AddWorkspacePlatformDto } from './dto/add-workspace-platform.dto.js'
import type { CreateWorkspaceDto } from './dto/create-workspace.dto.js'
import type { UpdateWorkspaceDto } from './dto/update-workspace.dto.js'

@Injectable()
export class WorkspacesService {
  constructor(private readonly dbService: DatabaseService) {}

  async list(userId: string) {
    const existing = await this.dbService.db.select({ id: workspaces.id }).from(workspaces).where(eq(workspaces.userId, userId)).limit(1)
    if (!existing.length) {
      await this.dbService.db.insert(workspaces).values({
        userId,
        name: 'Personal Launchpad',
        icon: 'i-lucide-user',
        color: '#3B82F6',
        isDefault: true,
      })
    }

    const rows = await this.dbService.db
      .select({
        id: workspaces.id,
        userId: workspaces.userId,
        name: workspaces.name,
        icon: workspaces.icon,
        color: workspaces.color,
        isDefault: workspaces.isDefault,
        platform: {
          id: workspacePlatforms.id,
          workspaceId: workspacePlatforms.workspaceId,
          platformId: workspacePlatforms.platformId,
          customUrl: workspacePlatforms.customUrl,
          displayOrder: workspacePlatforms.displayOrder,
          platformSlug: platforms.slug,
        },
      })
      .from(workspaces)
      .leftJoin(workspacePlatforms, eq(workspacePlatforms.workspaceId, workspaces.id))
      .leftJoin(platforms, eq(platforms.id, workspacePlatforms.platformId))
      .where(eq(workspaces.userId, userId))
      .orderBy(asc(workspaces.createdAt), asc(workspacePlatforms.displayOrder))

    const grouped = new Map<string, Omit<typeof rows[number], 'platform'> & { platforms: NonNullable<typeof rows[number]['platform']>[] }>()
    for (const row of rows) {
      const current = grouped.get(row.id) || {
        id: row.id,
        userId: row.userId,
        name: row.name,
        icon: row.icon,
        color: row.color,
        isDefault: row.isDefault,
        platforms: [],
      }
      if (row.platform?.id) current.platforms.push(row.platform)
      grouped.set(row.id, current)
    }
    return [...grouped.values()]
  }

  async create(userId: string, dto: CreateWorkspaceDto) {
    const existing = await this.dbService.db.select({ id: workspaces.id }).from(workspaces).where(eq(workspaces.userId, userId)).limit(1)
    const [workspace] = await this.dbService.db.insert(workspaces).values({
      userId,
      name: dto.name.trim(),
      icon: dto.icon,
      color: dto.color,
      isDefault: existing.length === 0,
    }).returning()
    return workspace
  }

  async update(userId: string, id: string, dto: UpdateWorkspaceDto) {
    const [workspace] = await this.dbService.db.update(workspaces).set({
      ...dto,
      name: dto.name?.trim(),
      updatedAt: new Date(),
    }).where(and(eq(workspaces.id, id), eq(workspaces.userId, userId))).returning()
    if (!workspace) throw new NotFoundException('Workspace not found')
    return workspace
  }

  async remove(userId: string, id: string) {
    const [workspace] = await this.dbService.db.delete(workspaces)
      .where(and(eq(workspaces.id, id), eq(workspaces.userId, userId)))
      .returning({ id: workspaces.id, isDefault: workspaces.isDefault })
    if (!workspace) throw new NotFoundException('Workspace not found')
    return { success: true, id: workspace.id }
  }

  async addPlatform(userId: string, workspaceId: string, dto: AddWorkspacePlatformDto) {
    const [workspace] = await this.dbService.db.select({ id: workspaces.id })
      .from(workspaces)
      .where(and(eq(workspaces.id, workspaceId), eq(workspaces.userId, userId)))
      .limit(1)
    if (!workspace) throw new NotFoundException('Workspace not found')

    const [platform] = await this.dbService.db.select({ id: platforms.id })
      .from(platforms)
      .where(eq(platforms.id, dto.platformId))
      .limit(1)
    if (!platform) throw new NotFoundException('Platform not found')

    const [existing] = await this.dbService.db.select({ id: workspacePlatforms.id })
      .from(workspacePlatforms)
      .where(and(eq(workspacePlatforms.workspaceId, workspaceId), eq(workspacePlatforms.platformId, dto.platformId)))
      .limit(1)
    if (existing) return existing

    const [item] = await this.dbService.db.insert(workspacePlatforms).values({
      workspaceId,
      platformId: dto.platformId,
      customUrl: dto.customUrl,
    }).returning()
    return item
  }
}
