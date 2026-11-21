import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'
import * as authSchema from './schema/auth'

export const todos = sqliteTable('todos', {
  id: integer({ mode: 'number' }).primaryKey({
    autoIncrement: true,
  }),
  title: text().notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(
    sql`(unixepoch())`,
  ),
})

export const files = sqliteTable('files', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  size: integer('size').notNull(),
  mimeType: text('mime_type').notNull(),
  url: text('url').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
})

export const employees = sqliteTable('employees', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  position: text('position').notNull(),
  department: text('department').notNull(),
  hireDate: integer('hire_date', { mode: 'timestamp_ms' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => new Date())
    .notNull(),
})

// Re-export Better Auth tables
export const user = authSchema.user
export const session = authSchema.session
export const account = authSchema.account
export const verification = authSchema.verification

export const userRelations = authSchema.userRelations
export const sessionRelations = authSchema.sessionRelations
export const accountRelations = authSchema.accountRelations
