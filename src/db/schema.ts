import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'
import * as authSchema from './schema/auth'
export {
  acknowledgementStatuses,
  acknowledgementTypes,
  assessmentAcknowledgements,
  assessmentDateChangeRequests,
  assessmentForms,
  assessmentHistory,
  assessmentStatuses,
  assessments,
  assessmentsRelations,
  dateChangeStatuses,
} from './schema/assessments'
export {
  additionalAssessmentCriteria,
  assessmentCriterionPoints,
  assessmentFileCriteria,
  assessmentFileCriteriaRelations,
  assessmentFileCriterionCatalog,
  assessmentFileForms,
  assessmentFiles,
  assessmentFilesRelations,
  assessmentFormLevels,
  assessmentFormMandatoryCriteria,
  evaluatedPersonTypes,
  previousAssessmentLevels,
  previousAssessmentOutcomes,
  promotionApplicationChoices,
} from './schema/assessment_files'

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

export const notifications = sqliteTable('notifications', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type', { enum: ['info', 'warning', 'success', 'error'] }).notNull().default('info'),
  href: text('href'),
  readAt: integer('read_at', { mode: 'timestamp_ms' }),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
})

export const reportingLines = sqliteTable('reporting_lines', {
  id: text('id').primaryKey(),
  employeeUserId: text('employee_user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  managerUserId: text('manager_user_id').notNull().references(() => user.id, { onDelete: 'restrict' }),
  startsAt: integer('starts_at', { mode: 'timestamp_ms' }).notNull(),
  endsAt: integer('ends_at', { mode: 'timestamp_ms' }),
  createdByUserId: text('created_by_user_id').notNull().references(() => user.id, { onDelete: 'restrict' }),
})

export const actingSubstitutions = sqliteTable('acting_substitutions', {
  id: text('id').primaryKey(),
  substituteUserId: text('substitute_user_id').notNull().references(() => user.id, { onDelete: 'restrict' }),
  representedUserId: text('represented_user_id').notNull().references(() => user.id, { onDelete: 'restrict' }),
  scope: text('scope').notNull(),
  startsAt: integer('starts_at', { mode: 'timestamp_ms' }).notNull(),
  endsAt: integer('ends_at', { mode: 'timestamp_ms' }),
  createdByUserId: text('created_by_user_id').notNull().references(() => user.id, { onDelete: 'restrict' }),
})

export const absences = sqliteTable('absences', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  startsAt: integer('starts_at', { mode: 'timestamp_ms' }).notNull(),
  endsAt: integer('ends_at', { mode: 'timestamp_ms' }).notNull(),
  continuous: integer('continuous', { mode: 'boolean' }).notNull().default(false),
  reason: text('reason'),
  recordedByUserId: text('recorded_by_user_id').notNull().references(() => user.id, { onDelete: 'restrict' }),
})

// Re-export Better Auth tables
export const user = authSchema.user
export const session = authSchema.session
export const account = authSchema.account
export const verification = authSchema.verification
export const userAuditLog = authSchema.userAuditLog

export const userRelations = authSchema.userRelations
export const sessionRelations = authSchema.sessionRelations
export const accountRelations = authSchema.accountRelations
