// src/database/schema.ts
import { boolean, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

// ==========================================
// USER & AUTHENTICATION TABLES
// ==========================================

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  avatarUrl: text('avatar_url'),
  googleId: text('google_id').unique(),
  passwordHash: text('password_hash'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
})

export const refreshSessions = pgTable('refresh_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: text('token_hash').notNull(),
  expiresAt: timestamp('expires_at', { mode: 'date' }).notNull(),
  isRevoked: boolean('is_revoked').default(false).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
})

// ==========================================
// PLATFORM MANAGEMENT TABLES
// ==========================================

export const platformCategories = pgTable('platform_categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull(),
  icon: text('icon').notNull(),
  color: text('color').notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
})

export const platformStatuses = pgTable('platform_statuses', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull(),
  color: text('color').notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
})

export const platforms = pgTable('platforms', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull(), // Non-unique to allow custom user platforms
  logo: text('logo').notNull().default('i-lucide-globe'),
  description: text('description').notNull().default(''),
  url: text('url').notNull(),
  color: text('color').notNull().default('#3B82F6'),
  badge: text('badge'),
  monthlyUsers: text('monthly_users'),
  isFeatured: boolean('is_featured').default(false).notNull(),
  isCustom: boolean('is_custom').default(false).notNull(), // Custom platform flag
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }), // Private ownership
  tags: text('tags').array().notNull().default([]),
  categoryId: uuid('category_id')
    .notNull()
    .references(() => platformCategories.id, { onDelete: 'cascade' }),
  statusId: uuid('status_id')
    .references(() => platformStatuses.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
})

export const workspaces = pgTable('workspaces', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  icon: text('icon').notNull().default('i-lucide-user'),
  color: text('color').notNull().default('#3B82F6'),
  isDefault: boolean('is_default').default(false).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
})

export const workspacePlatforms = pgTable('workspace_platforms', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  platformId: uuid('platform_id').notNull().references(() => platforms.id, { onDelete: 'cascade' }),
  customUrl: text('custom_url'),
  displayOrder: integer('display_order').default(0).notNull(),
})

// ==========================================
// DRIZZLE INFERRED TYPES
// ==========================================

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export type RefreshSession = typeof refreshSessions.$inferSelect
export type NewRefreshSession = typeof refreshSessions.$inferInsert

export type PlatformCategorySelect = typeof platformCategories.$inferSelect
export type NewPlatformCategory = typeof platformCategories.$inferInsert

export type PlatformStatusSelect = typeof platformStatuses.$inferSelect
export type NewPlatformStatus = typeof platformStatuses.$inferInsert

export type PlatformSelect = typeof platforms.$inferSelect
export type NewPlatform = typeof platforms.$inferInsert
export type Workspace = typeof workspaces.$inferSelect
export type NewWorkspace = typeof workspaces.$inferInsert
export type WorkspacePlatform = typeof workspacePlatforms.$inferSelect