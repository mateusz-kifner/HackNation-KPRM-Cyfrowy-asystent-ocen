import { relations, sql } from 'drizzle-orm'
import {
  check,
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core'
import { user } from './auth'

export const assessmentForms = ['A', 'B', 'C'] as const
export const assessmentStatuses = [
  'draft',
  'criteria_setting',
  'ready_for_assessment',
  'assessment_in_progress',
  'awaiting_employee_acknowledgement',
  'completed',
  'cancelled',
] as const
export const assessmentRatings = [
  'below_expectations',
  'meets_expectations',
  'exceeds_expectations',
] as const
export const acknowledgementTypes = [
  'criteria_participation',
  'result_receipt',
] as const
export const acknowledgementStatuses = ['acknowledged', 'unable', 'refused'] as const
export const dateChangeStatuses = ['pending', 'approved', 'rejected'] as const
export const assessmentHistoryActions = [
  'created',
  'evaluator_assigned',
  'criteria_updated',
  'details_updated',
  'submitted',
  'acknowledged',
  'date_changed',
  'date_change_decided',
  'review_outcome_recorded',
  'cancelled',
] as const

const now = sql`(cast(unixepoch('subsecond') * 1000 as integer))`

/** Each assessment owns its schedule, participants, workflow and outcome. */
export const assessments = sqliteTable(
  'assessments',
  {
    id: text('id').primaryKey(),
    evaluatedUserId: text('evaluated_user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'restrict' }),
    evaluatorUserId: text('evaluator_user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'restrict' }),
    appointedByUserId: text('appointed_by_user_id').references(() => user.id, {
      onDelete: 'set null',
    }),
    form: text('form', { enum: assessmentForms }),
    status: text('status', { enum: assessmentStatuses }).notNull().default('draft'),
    periodStart: integer('period_start', { mode: 'timestamp_ms' }),
    periodEnd: integer('period_end', { mode: 'timestamp_ms' }),
    criteriaDiscussionAt: integer('criteria_discussion_at', { mode: 'timestamp_ms' }),
    assessmentDate: integer('assessment_date', { mode: 'timestamp_ms' }),
    assessmentDiscussionAt: integer('assessment_discussion_at', { mode: 'timestamp_ms' }),
    dueAt: integer('due_at', { mode: 'timestamp_ms' }),
    overallResult: text('overall_result', { enum: assessmentRatings }),
    rationale: text('rationale'),
    developmentRecommendations: text('development_recommendations'),
    submittedAt: integer('submitted_at', { mode: 'timestamp_ms' }),
    completedAt: integer('completed_at', { mode: 'timestamp_ms' }),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(now),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(now)
      .$onUpdate(() => new Date()),
  },
  (table) => [
    check(
      'assessments_distinct_participants',
      sql`${table.evaluatedUserId} <> ${table.evaluatorUserId}`,
    ),
    check(
      'assessments_valid_period',
      sql`${table.periodStart} IS NULL OR ${table.periodEnd} IS NULL OR ${table.periodStart} <= ${table.periodEnd}`,
    ),
    index('assessments_evaluated_user_idx').on(table.evaluatedUserId),
    index('assessments_evaluator_idx').on(table.evaluatorUserId),
    index('assessments_status_due_idx').on(table.status, table.dueAt),
  ],
)

/** Catalog of criteria available on each assessment form. */
export const assessmentCriterionCatalog = sqliteTable(
  'assessment_criterion_catalog',
  {
    id: text('id').primaryKey(),
    form: text('form', { enum: assessmentForms }).notNull(),
    code: text('code').notNull(),
    title: text('title').notNull(),
    description: text('description'),
    mandatory: integer('mandatory', { mode: 'boolean' }).notNull().default(false),
    active: integer('active', { mode: 'boolean' }).notNull().default(true),
    sortOrder: integer('sort_order').notNull().default(0),
  },
  (table) => [uniqueIndex('assessment_criterion_form_code_idx').on(table.form, table.code)],
)

/** A snapshot of chosen criteria and ratings for one assessment. */
export const assessmentCriteria = sqliteTable(
  'assessment_criteria',
  {
    id: text('id').primaryKey(),
    assessmentId: text('assessment_id')
      .notNull()
      .references(() => assessments.id, { onDelete: 'cascade' }),
    catalogCriterionId: text('catalog_criterion_id').references(
      () => assessmentCriterionCatalog.id,
      { onDelete: 'set null' },
    ),
    code: text('code').notNull(),
    title: text('title').notNull(),
    description: text('description'),
    mandatory: integer('mandatory', { mode: 'boolean' }).notNull().default(false),
    sortOrder: integer('sort_order').notNull().default(0),
    duties: text('duties'),
    expectations: text('expectations'),
    goals: text('goals'),
    measurementMethod: text('measurement_method'),
    rating: text('rating', { enum: assessmentRatings }),
    comment: text('comment'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(now),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(now)
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex('assessment_criteria_assessment_code_idx').on(table.assessmentId, table.code),
    index('assessment_criteria_assessment_idx').on(table.assessmentId, table.sortOrder),
  ],
)

export const assessmentAcknowledgements = sqliteTable(
  'assessment_acknowledgements',
  {
    id: text('id').primaryKey(),
    assessmentId: text('assessment_id')
      .notNull()
      .references(() => assessments.id, { onDelete: 'cascade' }),
    type: text('type', { enum: acknowledgementTypes }).notNull(),
    status: text('status', { enum: acknowledgementStatuses }).notNull(),
    actorUserId: text('actor_user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'restrict' }),
    acknowledgedAt: integer('acknowledged_at', { mode: 'timestamp_ms' }).notNull().default(now),
    explanation: text('explanation'),
  },
  (table) => [
    uniqueIndex('assessment_acknowledgements_type_idx').on(table.assessmentId, table.type),
    index('assessment_acknowledgements_actor_idx').on(table.actorUserId),
  ],
)

export const assessmentDateChangeRequests = sqliteTable(
  'assessment_date_change_requests',
  {
    id: text('id').primaryKey(),
    assessmentId: text('assessment_id')
      .notNull()
      .references(() => assessments.id, { onDelete: 'cascade' }),
    requestedByUserId: text('requested_by_user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'restrict' }),
    currentDate: integer('current_date', { mode: 'timestamp_ms' }),
    proposedDate: integer('proposed_date', { mode: 'timestamp_ms' }).notNull(),
    reason: text('reason').notNull(),
    status: text('status', { enum: dateChangeStatuses }).notNull().default('pending'),
    decidedByUserId: text('decided_by_user_id').references(() => user.id, {
      onDelete: 'set null',
    }),
    decidedAt: integer('decided_at', { mode: 'timestamp_ms' }),
    decisionNote: text('decision_note'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(now),
  },
  (table) => [index('assessment_date_change_requests_idx').on(table.assessmentId, table.status)],
)

/** Append-only audit events; before/after values are JSON snapshots. */
export const assessmentHistory = sqliteTable(
  'assessment_history',
  {
    id: text('id').primaryKey(),
    assessmentId: text('assessment_id')
      .notNull()
      .references(() => assessments.id, { onDelete: 'cascade' }),
    actorUserId: text('actor_user_id').references(() => user.id, { onDelete: 'set null' }),
    action: text('action', { enum: assessmentHistoryActions }).notNull(),
    reason: text('reason'),
    beforeValue: text('before_value'),
    afterValue: text('after_value'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(now),
  },
  (table) => [index('assessment_history_assessment_idx').on(table.assessmentId, table.createdAt)],
)

export const assessmentsRelations = relations(assessments, ({ one, many }) => ({
  evaluatedUser: one(user, {
    fields: [assessments.evaluatedUserId],
    references: [user.id],
    relationName: 'assessmentEvaluatedUser',
  }),
  evaluator: one(user, {
    fields: [assessments.evaluatorUserId],
    references: [user.id],
    relationName: 'assessmentEvaluator',
  }),
  criteria: many(assessmentCriteria),
  acknowledgements: many(assessmentAcknowledgements),
  dateChangeRequests: many(assessmentDateChangeRequests),
  history: many(assessmentHistory),
}))

export const assessmentCriteriaRelations = relations(assessmentCriteria, ({ one }) => ({
  assessment: one(assessments, {
    fields: [assessmentCriteria.assessmentId],
    references: [assessments.id],
  }),
  catalogCriterion: one(assessmentCriterionCatalog, {
    fields: [assessmentCriteria.catalogCriterionId],
    references: [assessmentCriterionCatalog.id],
  }),
}))
