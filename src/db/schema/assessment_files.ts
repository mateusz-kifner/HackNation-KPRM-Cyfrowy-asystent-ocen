import { relations, sql } from "drizzle-orm";
import {
	check,
	integer,
	real,
	sqliteTable,
	text,
	uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { assessments } from "./assessments";

export const assessmentCriterionPoints = [1, 3, 5, 7, 9] as const;
export const previousAssessmentOutcomes = [
	"positive",
	"negative",
	"none",
] as const;
export const previousAssessmentLevels = [
	"far_below_expectations",
	"below_expectations",
	"meets_expectations",
	"above_expectations",
	"far_above_expectations",
] as const;
export const promotionApplicationChoices = [
	"yes",
	"no",
	"not_applicable",
] as const;
export const evaluatedPersonTypes = [
	"civil_service_official",
	"civil_service_employee",
] as const;
export const assessmentFileForms = ["A", "B", "C"] as const;
export const assessmentFormMandatoryCriteria = {
	A: [
		"Zarządzanie ludźmi",
		"Podejmowanie decyzji i odpowiedzialność",
		"Organizacja pracy i orientacja na osiąganie celów",
		"Współpraca",
		"Komunikacja",
		"Zarządzanie strategiczne",
	],
	B: [
		"Zarządzanie ludźmi",
		"Podejmowanie decyzji i odpowiedzialność",
		"Organizacja pracy i orientacja na osiąganie celów",
		"Współpraca",
		"Komunikacja",
	],
	C: [
		"Wykorzystywanie wiedzy i doskonalenie zawodowe",
		"Rzetelność",
		"Organizacja pracy i orientacja na osiąganie celów",
		"Współpraca",
		"Komunikacja",
	],
} as const;
export const additionalAssessmentCriteria = [
	"Kreatywność",
	"Negocjowanie",
	"Orientacja na klienta/interesanta",
	"Podejmowanie decyzji i odpowiedzialność",
	"Radzenie sobie w sytuacjach kryzysowych",
	"Myślenie analityczne",
	"Wystąpienia publiczne",
	"Zarządzanie ludźmi",
	"Zarządzanie strategiczne",
] as const;
export const assessmentFormLevels = [
	"far_below_expectations",
	"below_expectations",
	"meets_expectations",
	"above_expectations",
	"far_above_expectations",
] as const;

const now = sql`(cast(unixepoch('subsecond') * 1000 as integer))`;

/** Source criteria defined by forms A, B, and C; extra criteria can be seeded here. */
export const assessmentFileCriterionCatalog = sqliteTable(
	"assessment_file_criterion_catalog",
	{
		id: text("id").primaryKey(),
		form: text("form", { enum: assessmentFileForms }).notNull(),
		code: text("code").notNull(),
		title: text("title").notNull(),
		description: text("description"),
		mandatory: integer("mandatory", { mode: "boolean" })
			.notNull()
			.default(false),
		active: integer("active", { mode: "boolean" }).notNull().default(true),
		sortOrder: integer("sort_order").notNull().default(0),
	},
	(table) => [
		uniqueIndex("assessment_file_criterion_form_code_idx").on(
			table.form,
			table.code,
		),
	],
);

/** Form-specific values and historical display snapshots for a single assessment. */
export const assessmentFiles = sqliteTable(
	"assessment_files",
	{
		id: text("id").primaryKey(),
		assessmentId: text("assessment_id")
			.notNull()
			.references(() => assessments.id, { onDelete: "cascade" }),

		// Part I: institution and participant display data as it appeared on the form.
		agencyName: text("agency_name"),
		evaluatedFirstName: text("evaluated_first_name"),
		evaluatedLastName: text("evaluated_last_name"),
		evaluatedPersonType: text("evaluated_person_type", {
			enum: evaluatedPersonTypes,
		}),
		evaluatedOrganizationalUnit: text("evaluated_organizational_unit"),
		evaluatedPosition: text("evaluated_position"),
		evaluatorFirstName: text("evaluator_first_name"),
		evaluatorLastName: text("evaluator_last_name"),
		evaluatorOrganizationalUnit: text("evaluator_organizational_unit"),
		evaluatorPosition: text("evaluator_position"),

		// Part I/II: discussion acknowledgements are also recorded in the shared
		// acknowledgement table; these fields preserve the printable form values.
		criteriaDiscussionLocation: text("criteria_discussion_location"),
		criteriaDiscussionDate: integer("criteria_discussion_date", {
			mode: "timestamp_ms",
		}),
		criteriaDiscussionEvaluatorName: text("criteria_discussion_evaluator_name"),
		criteriaDiscussionEmployeeName: text("criteria_discussion_employee_name"),
		assessmentDiscussionDate: integer("assessment_discussion_date", {
			mode: "timestamp_ms",
		}),
		assessmentPeriodStart: integer("assessment_period_start", {
			mode: "timestamp_ms",
		}),
		assessmentPeriodEnd: integer("assessment_period_end", {
			mode: "timestamp_ms",
		}),

		// Part II: calculated result and narrative fields.
		averagePoints: real("average_points"),
		overallLevel: text("overall_level", { enum: assessmentFormLevels }),
		overallOutcome: text("overall_outcome", { enum: ["positive", "negative"] }),
		assessmentRationale: text("assessment_rationale"),
		developmentPlanRecommendations: text("development_plan_recommendations"),

		// Previous civil service assessment section (optional when no history exists).
		previousAssessmentOutcome: text("previous_assessment_outcome", {
			enum: previousAssessmentOutcomes,
		}),
		previousAssessmentLevel: text("previous_assessment_level", {
			enum: previousAssessmentLevels,
		}),
		previousAssessmentDate: integer("previous_assessment_date", {
			mode: "timestamp_ms",
		}),

		// Civil service grade application section.
		promotionApplication: text("promotion_application", {
			enum: promotionApplicationChoices,
		}),
		civilServiceAppointmentYear: integer("civil_service_appointment_year"),
		currentCivilServiceGrade: integer("current_civil_service_grade"),
		currentGradeGrantedAt: integer("current_grade_granted_at", {
			mode: "timestamp_ms",
		}),
		requestedCivilServiceGrade: integer("requested_civil_service_grade"),
		promotionApplicationRationale: text("promotion_application_rationale"),
		promotionApplicationLocation: text("promotion_application_location"),
		promotionApplicationDate: integer("promotion_application_date", {
			mode: "timestamp_ms",
		}),
		promotionApplicationEvaluatorName: text(
			"promotion_application_evaluator_name",
		),

		// Signature/display fields and statutory notice destination.
		evaluatorSignatureLocation: text("evaluator_signature_location"),
		evaluatorSignedAt: integer("evaluator_signed_at", { mode: "timestamp_ms" }),
		employeeReceiptLocation: text("employee_receipt_location"),
		employeeAcknowledgedAt: integer("employee_acknowledged_at", {
			mode: "timestamp_ms",
		}),
		employeeReceiptName: text("employee_receipt_name"),
		objectionRecipient: text("objection_recipient"),

		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.notNull()
			.default(now),
		updatedAt: integer("updated_at", { mode: "timestamp_ms" })
			.notNull()
			.default(now)
			.$onUpdate(() => new Date()),
	},
	(table) => [
		uniqueIndex("assessment_files_assessment_idx").on(table.assessmentId),
		check(
			"assessment_files_average_points_range",
			sql`${table.averagePoints} IS NULL OR (${table.averagePoints} >= 1 AND ${table.averagePoints} <= 9)`,
		),
		check(
			"assessment_files_period_valid",
			sql`${table.assessmentPeriodStart} IS NULL OR ${table.assessmentPeriodEnd} IS NULL OR ${table.assessmentPeriodStart} <= ${table.assessmentPeriodEnd}`,
		),
		check(
			"assessment_files_grade_range",
			sql`(${table.currentCivilServiceGrade} IS NULL OR ${table.currentCivilServiceGrade} BETWEEN 1 AND 9) AND (${table.requestedCivilServiceGrade} IS NULL OR ${table.requestedCivilServiceGrade} BETWEEN 1 AND 9)`,
		),
	],
);

/** Form criteria are snapshotted so catalog edits cannot rewrite a past form. */
export const assessmentFileCriteria = sqliteTable(
	"assessment_file_criteria",
	{
		id: text("id").primaryKey(),
		assessmentFileId: text("assessment_file_id")
			.notNull()
			.references(() => assessmentFiles.id, { onDelete: "cascade" }),
		catalogCriterionId: text("catalog_criterion_id").references(
			() => assessmentFileCriterionCatalog.id,
			{ onDelete: "set null" },
		),
		code: text("code").notNull(),
		title: text("title").notNull(),
		description: text("description"),
		mandatory: integer("mandatory", { mode: "boolean" })
			.notNull()
			.default(false),
		sortOrder: integer("sort_order").notNull().default(0),
		duties: text("duties"),
		expectations: text("expectations"),
		goals: text("goals"),
		measurementMethod: text("measurement_method"),
		points: integer("points"),
		comment: text("comment"),
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.notNull()
			.default(now),
		updatedAt: integer("updated_at", { mode: "timestamp_ms" })
			.notNull()
			.default(now)
			.$onUpdate(() => new Date()),
	},
	(table) => [
		uniqueIndex("assessment_file_criteria_code_idx").on(
			table.assessmentFileId,
			table.code,
		),
		check(
			"assessment_file_criteria_points_valid",
			sql`${table.points} IS NULL OR ${table.points} IN (1, 3, 5, 7, 9)`,
		),
	],
);

export const assessmentFilesRelations = relations(
	assessmentFiles,
	({ one, many }) => ({
		assessment: one(assessments, {
			fields: [assessmentFiles.assessmentId],
			references: [assessments.id],
		}),
		criteria: many(assessmentFileCriteria),
	}),
);

export const assessmentFileCriteriaRelations = relations(
	assessmentFileCriteria,
	({ one }) => ({
		assessmentFile: one(assessmentFiles, {
			fields: [assessmentFileCriteria.assessmentFileId],
			references: [assessmentFiles.id],
		}),
		catalogCriterion: one(assessmentFileCriterionCatalog, {
			fields: [assessmentFileCriteria.catalogCriterionId],
			references: [assessmentFileCriterionCatalog.id],
		}),
	}),
);
