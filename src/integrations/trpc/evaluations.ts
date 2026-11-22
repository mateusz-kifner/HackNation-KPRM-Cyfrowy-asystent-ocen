import { randomUUID } from "node:crypto";
import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, like, ne, or, lt, isNotNull } from "drizzle-orm";
import { z } from "zod";
import { db } from "#/db";
import {
	acknowledgementTypes,
	additionalAssessmentCriteria,
	assessmentAcknowledgements,
	assessmentCriterionPoints,
	assessmentDateChangeRequests,
	assessmentFileCriteria,
	assessmentFiles,
	assessmentFormMandatoryCriteria,
	assessmentHistory,
	assessments,
	user,
} from "#/db/schema";
import { generateAssessmentDocx } from "#/lib/documents/assessment-docx";
import {
	assertCanEditAssessment,
	assertCanViewAssessment,
	assertUserExists,
	getAssessmentOrThrow,
} from "./evaluations/access";
import { employeeProcedure, managerProcedure } from "./init";

const dateInput = z.coerce.date().nullable().optional();

const assessmentFileInput = z.object({
	agencyName: z.string().nullable().optional(),
	evaluatedFirstName: z.string().nullable().optional(),
	evaluatedLastName: z.string().nullable().optional(),
	evaluatedPersonType: z
		.enum(["civil_service_official", "civil_service_employee"])
		.nullable()
		.optional(),
	evaluatedOrganizationalUnit: z.string().nullable().optional(),
	evaluatedPosition: z.string().nullable().optional(),
	evaluatorFirstName: z.string().nullable().optional(),
	evaluatorLastName: z.string().nullable().optional(),
	evaluatorOrganizationalUnit: z.string().nullable().optional(),
	evaluatorPosition: z.string().nullable().optional(),
	criteriaDiscussionLocation: z.string().nullable().optional(),

	assessmentRationale: z.string().nullable().optional(),
	overallLevel: z
		.enum([
			"far_below_expectations",
			"below_expectations",
			"meets_expectations",
			"above_expectations",
			"far_above_expectations",
		])
		.nullable()
		.optional(),
	overallOutcome: z.enum(["positive", "negative"]).nullable().optional(),
	developmentPlanRecommendations: z.string().nullable().optional(),
	previousAssessmentOutcome: z
		.enum(["positive", "negative", "none"])
		.nullable()
		.optional(),
	previousAssessmentLevel: z
		.enum([
			"far_below_expectations",
			"below_expectations",
			"meets_expectations",
			"above_expectations",
			"far_above_expectations",
		])
		.nullable()
		.optional(),
	previousAssessmentDate: dateInput,
	promotionApplication: z
		.enum(["yes", "no", "not_applicable"])
		.nullable()
		.optional(),
	civilServiceAppointmentYear: z
		.number()
		.int()
		.min(2008)
		.max(new Date().getFullYear())
		.nullable()
		.optional(),
	currentCivilServiceGrade: z
		.number()
		.int()
		.min(1)
		.max(9)
		.nullable()
		.optional(),
	currentGradeGrantedAt: dateInput,
	requestedCivilServiceGrade: z
		.number()
		.int()
		.min(1)
		.max(9)
		.nullable()
		.optional(),
	promotionApplicationRationale: z.string().nullable().optional(),
	promotionApplicationLocation: z.string().nullable().optional(),
	promotionApplicationDate: dateInput,
	promotionApplicationEvaluatorName: z.string().nullable().optional(),
	evaluatorSignatureLocation: z.string().nullable().optional(),
	objectionRecipient: z.string().nullable().optional(),
});

const criteriaInput = z.object({
	code: z.string().min(1),
	title: z.string().min(1),
	mandatory: z.boolean(),
	description: z.string().nullable().optional(),
	duties: z.string().nullable().optional(),
	expectations: z.string().nullable().optional(),
	goals: z.string().nullable().optional(),
	measurementMethod: z.string().nullable().optional(),
});

function normalizeCriteria(
	form: keyof typeof assessmentFormMandatoryCriteria,
	criteria: z.infer<typeof criteriaInput>[],
) {
	const required = assessmentFormMandatoryCriteria[form];
	const mandatory = criteria.filter((criterion) => criterion.mandatory);
	const additional = criteria.filter((criterion) => !criterion.mandatory);
	const isUnique =
		new Set(criteria.map((criterion) => criterion.code)).size ===
		criteria.length;

	if (
		mandatory.length !== required.length ||
		!required.every((title) =>
			mandatory.some((criterion) => criterion.title === title),
		) ||
		additional.length > 3 ||
		!isUnique ||
		new Set(criteria.map((criterion) => criterion.title)).size !==
			criteria.length ||
		additional.some(
			(criterion) =>
				!additionalAssessmentCriteria.includes(
					criterion.title as (typeof additionalAssessmentCriteria)[number],
				) || required.some((title) => title === criterion.title),
		)
	) {
		throw new TRPCError({
			code: "BAD_REQUEST",
			message:
				"Include all mandatory criteria and at most three unique eligible additional criteria.",
		});
	}

	return criteria.map((criterion, sortOrder) => ({ ...criterion, sortOrder }));
}

function calculateAverage(points: number[]) {
	return points.reduce((sum, value) => sum + value, 0) / points.length;
}

async function addHistory(
	tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
	assessmentId: string,
	actorUserId: string,
	action: (typeof assessmentHistory.$inferInsert)["action"],
	beforeValue?: unknown,
	afterValue?: unknown,
	reason?: string,
) {
	await tx.insert(assessmentHistory).values({
		id: randomUUID(),
		assessmentId,
		actorUserId,
		action,
		reason,
		beforeValue: beforeValue === undefined ? null : JSON.stringify(beforeValue),
		afterValue: afterValue === undefined ? null : JSON.stringify(afterValue),
	});
}

export const evaluationsRouter = {
	candidates: managerProcedure
		.input(
			z.object({ query: z.string().trim().max(100).optional() }).optional(),
		)
		.query(async ({ input }) => {
			const query = input?.query;
			return db
				.select({
					id: user.id,
					name: user.name,
					email: user.email,
					role: user.role,
					position: user.position,
					organizationalUnit: user.organizationalUnit,
				})
				.from(user)
				.where(
					query
						? or(
								like(user.name, `%${query}%`),
								like(user.email, `%${query}%`),
								like(user.position, `%${query}%`),
								like(user.organizationalUnit, `%${query}%`),
							)
						: undefined,
				)
				.orderBy(user.name);
		}),

	options: employeeProcedure.query(() => ({
		forms: assessmentFormMandatoryCriteria,
		additionalCriteria: additionalAssessmentCriteria,
		ratingPoints: assessmentCriterionPoints,
	})),

	list: employeeProcedure
		.input(
			z
				.object({
					query: z.string().trim().max(100).optional(),
					status: z
						.enum([
							"draft",
							"criteria_setting",
							"ready_for_assessment",
							"assessment_in_progress",
							"awaiting_employee_acknowledgement",
							"completed",
							"cancelled",
						])
						.optional(),
					evaluatorUserId: z.string().optional(),
					evaluatedUserId: z.string().optional(),
					overdueOnly: z.boolean().optional(),
				})
				.optional(),
		)
		.query(async ({ ctx, input }) => {
			const actorId = ctx.user.id;
			const query = input?.query;
			const searchCondition = query
				? or(
						like(assessments.id, `%${query}%`),
						like(assessments.form, `%${query}%`),
						like(assessments.status, `%${query}%`),
					)
				: undefined;
			const filters = [
				searchCondition,
				input?.status ? eq(assessments.status, input.status) : undefined,
				input?.evaluatorUserId
					? eq(assessments.evaluatorUserId, input.evaluatorUserId)
					: undefined,
				input?.evaluatedUserId
					? eq(assessments.evaluatedUserId, input.evaluatedUserId)
					: undefined,
				input?.overdueOnly
					? and(
							isNotNull(assessments.dueAt),
							lt(assessments.dueAt, new Date()),
							ne(assessments.status, "completed"),
						)
					: undefined,
			];
			if (ctx.role === "Manager" || ctx.role === "Admin") {
				return db
					.select()
					.from(assessments)
					.where(and(...filters))
					.orderBy(desc(assessments.createdAt));
			}

			return db
				.select()
				.from(assessments)
				.where(
					and(
						...filters,
						or(
							eq(assessments.evaluatedUserId, actorId),
							eq(assessments.evaluatorUserId, actorId),
						),
					),
				)
				.orderBy(desc(assessments.createdAt));
		}),

	search: employeeProcedure
		.input(z.object({ query: z.string().trim().min(1).max(100) }))
		.query(async ({ input, ctx }) => {
			const pattern = `%${input.query}%`;
			const matchesQuery = or(
				like(assessments.id, pattern),
				like(assessmentFiles.evaluatedFirstName, pattern),
				like(assessmentFiles.evaluatedLastName, pattern),
				like(assessmentFiles.evaluatorFirstName, pattern),
				like(assessmentFiles.evaluatorLastName, pattern),
				like(assessmentFiles.evaluatedPosition, pattern),
				like(assessmentFiles.evaluatedOrganizationalUnit, pattern),
			);
			const conditions = [matchesQuery];

			if (ctx.role === "Employee") {
				conditions.push(
					or(
						eq(assessments.evaluatedUserId, ctx.user.id),
						eq(assessments.evaluatorUserId, ctx.user.id),
					),
				);
			}

			return db
				.select({
					id: assessments.id,
					evaluatedUserId: assessments.evaluatedUserId,
					evaluatorUserId: assessments.evaluatorUserId,
					form: assessments.form,
					status: assessments.status,
					periodStart: assessments.periodStart,
					periodEnd: assessments.periodEnd,
					assessmentDate: assessments.assessmentDate,
					dueAt: assessments.dueAt,
					submittedAt: assessments.submittedAt,
					createdAt: assessments.createdAt,
					evaluatedFirstName: assessmentFiles.evaluatedFirstName,
					evaluatedLastName: assessmentFiles.evaluatedLastName,
					evaluatedPosition: assessmentFiles.evaluatedPosition,
					evaluatedOrganizationalUnit:
						assessmentFiles.evaluatedOrganizationalUnit,
				})
				.from(assessments)
				.leftJoin(
					assessmentFiles,
					eq(assessmentFiles.assessmentId, assessments.id),
				)
				.where(and(...conditions))
				.orderBy(desc(assessments.createdAt))
				.limit(50);
		}),

	assignedToMe: employeeProcedure
		.input(
			z.object({ query: z.string().trim().max(100).optional() }).optional(),
		)
		.query(async ({ ctx, input }) => {
			const queryText = input?.query;
			const searchCondition = queryText
				? or(
						like(assessments.id, `%${queryText}%`),
						like(assessments.form, `%${queryText}%`),
						like(assessments.status, `%${queryText}%`),
						like(assessmentFiles.evaluatedFirstName, `%${queryText}%`),
						like(assessmentFiles.evaluatedLastName, `%${queryText}%`),
						like(assessmentFiles.evaluatedPosition, `%${queryText}%`),
						like(assessmentFiles.evaluatedOrganizationalUnit, `%${queryText}%`),
					)
				: undefined;
			const query = db
				.select({
					id: assessments.id,
					evaluatedUserId: assessments.evaluatedUserId,
					evaluatorUserId: assessments.evaluatorUserId,
					form: assessments.form,
					status: assessments.status,
					periodStart: assessments.periodStart,
					periodEnd: assessments.periodEnd,
					assessmentDate: assessments.assessmentDate,
					dueAt: assessments.dueAt,
					submittedAt: assessments.submittedAt,
					createdAt: assessments.createdAt,
					evaluatedFirstName: assessmentFiles.evaluatedFirstName,
					evaluatedLastName: assessmentFiles.evaluatedLastName,
					evaluatedPosition: assessmentFiles.evaluatedPosition,
					evaluatedOrganizationalUnit:
						assessmentFiles.evaluatedOrganizationalUnit,
				})
				.from(assessments)
				.leftJoin(
					assessmentFiles,
					eq(assessmentFiles.assessmentId, assessments.id),
				);

			if (ctx.role === "Manager" || ctx.role === "Admin") {
				return query
					.where(searchCondition)
					.orderBy(desc(assessments.createdAt));
			}

			return query
				.where(
					and(eq(assessments.evaluatorUserId, ctx.user.id), searchCondition),
				)
				.orderBy(desc(assessments.createdAt));
		}),

	evaluatedForMe: employeeProcedure.query(async ({ ctx }) => {
		return db
			.select({
				id: assessments.id,
				evaluatedUserId: assessments.evaluatedUserId,
				evaluatorUserId: assessments.evaluatorUserId,
				form: assessments.form,
				status: assessments.status,
				periodStart: assessments.periodStart,
				periodEnd: assessments.periodEnd,
				assessmentDate: assessments.assessmentDate,
				dueAt: assessments.dueAt,
				submittedAt: assessments.submittedAt,
				createdAt: assessments.createdAt,
				evaluatedFirstName: assessmentFiles.evaluatedFirstName,
				evaluatedLastName: assessmentFiles.evaluatedLastName,
				evaluatedPosition: assessmentFiles.evaluatedPosition,
				evaluatedOrganizationalUnit:
					assessmentFiles.evaluatedOrganizationalUnit,
			})
			.from(assessments)
			.leftJoin(
				assessmentFiles,
				eq(assessmentFiles.assessmentId, assessments.id),
			)
			.where(
				and(
					eq(assessments.evaluatedUserId, ctx.user.id),
					ne(assessments.evaluatorUserId, ctx.user.id),
				),
			)
			.orderBy(desc(assessments.createdAt));
	}),

	get: employeeProcedure
		.input(z.object({ id: z.string().min(1) }))
		.query(async ({ input, ctx }) => {
			const assessment = await getAssessmentOrThrow(input.id);
			assertCanViewAssessment(assessment, ctx.user);
			const [
				[form],
				acknowledgements,
				dateChangeRequests,
				history,
				[assignedEvaluator],
			] = await Promise.all([
				db
					.select()
					.from(assessmentFiles)
					.where(eq(assessmentFiles.assessmentId, input.id))
					.limit(1),
				db
					.select()
					.from(assessmentAcknowledgements)
					.where(eq(assessmentAcknowledgements.assessmentId, input.id)),
				db
					.select()
					.from(assessmentDateChangeRequests)
					.where(eq(assessmentDateChangeRequests.assessmentId, input.id))
					.orderBy(desc(assessmentDateChangeRequests.createdAt)),
				db
					.select()
					.from(assessmentHistory)
					.where(eq(assessmentHistory.assessmentId, input.id))
					.orderBy(desc(assessmentHistory.createdAt)),
				db
					.select({ id: user.id, name: user.name, email: user.email })
					.from(user)
					.where(eq(user.id, assessment.evaluatorUserId))
					.limit(1),
			]);
			const criteria = form
				? await db
						.select()
						.from(assessmentFileCriteria)
						.where(eq(assessmentFileCriteria.assessmentFileId, form.id))
				: [];
			return {
				...assessment,
				assignedEvaluator: assignedEvaluator ?? null,
				nextRequiredAction: getNextRequiredAction(assessment, acknowledgements),
				file: form ?? null,
				criteria,
				acknowledgements,
				dateChangeRequests,
				history,
			};
		}),

	exportDocx: employeeProcedure
		.input(z.object({ id: z.string().min(1) }))
		.mutation(async ({ input, ctx }) => {
			const assessment = await getAssessmentOrThrow(input.id);
			assertCanViewAssessment(assessment, ctx.user);
			const [file] = await db
				.select()
				.from(assessmentFiles)
				.where(eq(assessmentFiles.assessmentId, input.id))
				.limit(1);
			const criteria = file
				? await db
						.select()
						.from(assessmentFileCriteria)
						.where(eq(assessmentFileCriteria.assessmentFileId, file.id))
				: [];
			const bytes = await generateAssessmentDocx(
				assessment,
				file ?? null,
				criteria,
			);
			return {
				filename: `ocena-${assessment.form ?? "arkusz"}-${assessment.id}.docx`,
				contentBase64: bytes.toString("base64"),
			};
		}),

	create: managerProcedure
		.input(
			z
				.object({
					evaluatedUserId: z.string().min(1),
					evaluatorUserId: z.string().min(1),
					form: z.enum(["A", "B", "C"]),
					periodStart: dateInput,
					periodEnd: dateInput,
					criteriaDiscussionAt: dateInput,
					assessmentDate: dateInput,
					assessmentDiscussionAt: dateInput,
					dueAt: dateInput,
					file: assessmentFileInput.optional(),
				})
				.refine((data) => data.evaluatedUserId !== data.evaluatorUserId, {
					message:
						"The evaluator and evaluated person must be different users.",
					path: ["evaluatorUserId"],
				})
				.refine(
					(data) =>
						!data.periodStart ||
						!data.periodEnd ||
						data.periodStart <= data.periodEnd,
					{
						message: "The assessment period start must be before its end.",
						path: ["periodEnd"],
					},
				),
		)
		.mutation(async ({ input, ctx }) => {
			await Promise.all([
				assertUserExists(input.evaluatedUserId),
				assertUserExists(input.evaluatorUserId),
			]);
			const mandatoryCriteria = assessmentFormMandatoryCriteria[input.form];
			const assessmentId = randomUUID();
			const formFileId = randomUUID();

			return db.transaction(async (tx) => {
				const [created] = await tx
					.insert(assessments)
					.values({
						id: assessmentId,
						evaluatedUserId: input.evaluatedUserId,
						evaluatorUserId: input.evaluatorUserId,
						appointedByUserId: ctx.user.id,
						form: input.form,
						status: "criteria_setting",
						periodStart: input.periodStart,
						periodEnd: input.periodEnd,
						criteriaDiscussionAt: input.criteriaDiscussionAt,
						assessmentDate: input.assessmentDate,
						assessmentDiscussionAt: input.assessmentDiscussionAt,
						dueAt: input.dueAt,
					})
					.returning();

				const [evaluated] = await tx
					.select()
					.from(user)
					.where(eq(user.id, input.evaluatedUserId))
					.limit(1);
				const [evaluator] = await tx
					.select()
					.from(user)
					.where(eq(user.id, input.evaluatorUserId))
					.limit(1);
				await tx.insert(assessmentFiles).values({
					id: formFileId,
					assessmentId,
					evaluatedFirstName: evaluated?.name.split(/\s+/)[0] ?? null,
					evaluatedLastName:
						evaluated?.name.split(/\s+/).slice(1).join(" ") ?? null,
					evaluatedOrganizationalUnit: evaluated?.organizationalUnit ?? null,
					evaluatedPosition: evaluated?.position ?? null,
					evaluatorFirstName: evaluator?.name.split(/\s+/)[0] ?? null,
					evaluatorLastName:
						evaluator?.name.split(/\s+/).slice(1).join(" ") ?? null,
					evaluatorOrganizationalUnit: evaluator?.organizationalUnit ?? null,
					evaluatorPosition: evaluator?.position ?? null,
					criteriaDiscussionEvaluatorName: evaluator?.name ?? null,
					criteriaDiscussionDate: input.criteriaDiscussionAt,
					assessmentDiscussionDate: input.assessmentDiscussionAt,
					assessmentPeriodStart: input.periodStart,
					assessmentPeriodEnd: input.periodEnd,
					...input.file,
				});
				await tx.insert(assessmentFileCriteria).values(
					mandatoryCriteria.map((title, sortOrder) => ({
						id: randomUUID(),
						assessmentFileId: formFileId,
						code: `mandatory-${sortOrder + 1}`,
						title,
						mandatory: true,
						sortOrder,
					})),
				);
				await addHistory(
					tx,
					assessmentId,
					ctx.user.id,
					"created",
					undefined,
					created,
				);
				await addHistory(
					tx,
					assessmentId,
					ctx.user.id,
					"evaluator_assigned",
					undefined,
					{
						evaluatorUserId: input.evaluatorUserId,
						appointedByUserId: ctx.user.id,
					},
				);
				return created;
			});
		}),

	assignEvaluator: managerProcedure
		.input(
			z.object({
				assessmentId: z.string().min(1),
				evaluatorUserId: z.string().min(1),
				reason: z.string().nullable().optional(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const assessment = await getAssessmentOrThrow(input.assessmentId);
			if (assessment.evaluatedUserId === input.evaluatorUserId) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "A user cannot evaluate themself.",
				});
			}
			if (ctx.role === "Admin" && !input.reason?.trim()) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "An Admin evaluator reassignment requires a reason.",
				});
			}
			if (assessment.submittedAt && ctx.role !== "Admin") {
				throw new TRPCError({
					code: "PRECONDITION_FAILED",
					message:
						"Changing the evaluator after submission requires an Admin correction.",
				});
			}
			await assertUserExists(input.evaluatorUserId);
			const [newEvaluator] = await db
				.select()
				.from(user)
				.where(eq(user.id, input.evaluatorUserId))
				.limit(1);
			return db.transaction(async (tx) => {
				const [updated] = await tx
					.update(assessments)
					.set({
						evaluatorUserId: input.evaluatorUserId,
						appointedByUserId: ctx.user.id,
					})
					.where(eq(assessments.id, input.assessmentId))
					.returning();
				await tx
					.update(assessmentFiles)
					.set({
						evaluatorFirstName: newEvaluator?.name.split(/\s+/)[0] ?? null,
						evaluatorLastName:
							newEvaluator?.name.split(/\s+/).slice(1).join(" ") ?? null,
						evaluatorOrganizationalUnit:
							newEvaluator?.organizationalUnit ?? null,
						evaluatorPosition: newEvaluator?.position ?? null,
					})
					.where(eq(assessmentFiles.assessmentId, input.assessmentId));
				await addHistory(
					tx,
					input.assessmentId,
					ctx.user.id,
					"evaluator_assigned",
					{
						evaluatorUserId: assessment.evaluatorUserId,
						appointedByUserId: assessment.appointedByUserId,
					},
					{
						evaluatorUserId: input.evaluatorUserId,
						appointedByUserId: ctx.user.id,
					},
					input.reason ?? undefined,
				);
				return updated;
			});
		}),

	selectForm: employeeProcedure
		.input(
			z.object({
				assessmentId: z.string().min(1),
				form: z.enum(["A", "B", "C"]),
				reason: z.string().nullable().optional(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const assessment = await getAssessmentOrThrow(input.assessmentId);
			assertCanEditAssessment(assessment, ctx.user);
			if (assessment.submittedAt && ctx.role !== "Admin") {
				throw new TRPCError({
					code: "PRECONDITION_FAILED",
					message:
						"Changing a submitted assessment form requires an Admin correction.",
				});
			}
			if (ctx.role === "Admin" && !input.reason?.trim()) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "An Admin correction requires a reason.",
				});
			}
			const [criteriaAcknowledgement] = await db
				.select()
				.from(assessmentAcknowledgements)
				.where(
					and(
						eq(assessmentAcknowledgements.assessmentId, input.assessmentId),
						eq(assessmentAcknowledgements.type, "criteria_participation"),
					),
				)
				.limit(1);
			if (criteriaAcknowledgement && ctx.role !== "Admin") {
				throw new TRPCError({
					code: "PRECONDITION_FAILED",
					message:
						"The form is locked after the criteria participation acknowledgement.",
				});
			}
			const [file] = await db
				.select()
				.from(assessmentFiles)
				.where(eq(assessmentFiles.assessmentId, input.assessmentId))
				.limit(1);
			if (!file)
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Assessment form not found.",
				});
			const previousCriteria = await db
				.select()
				.from(assessmentFileCriteria)
				.where(eq(assessmentFileCriteria.assessmentFileId, file.id));
			const mandatoryCriteria = assessmentFormMandatoryCriteria[input.form];
			return db.transaction(async (tx) => {
				const [updatedAssessment] = await tx
					.update(assessments)
					.set({ form: input.form })
					.where(eq(assessments.id, input.assessmentId))
					.returning();
				await tx
					.delete(assessmentFileCriteria)
					.where(eq(assessmentFileCriteria.assessmentFileId, file.id));
				const updatedCriteria = await tx
					.insert(assessmentFileCriteria)
					.values(
						mandatoryCriteria.map((title, sortOrder) => ({
							id: randomUUID(),
							assessmentFileId: file.id,
							code: `mandatory-${sortOrder + 1}`,
							title,
							mandatory: true,
							sortOrder,
						})),
					)
					.returning();
				await addHistory(
					tx,
					input.assessmentId,
					ctx.user.id,
					"criteria_updated",
					{ form: assessment.form, criteria: previousCriteria },
					{ form: input.form, criteria: updatedCriteria },
					input.reason ?? undefined,
				);
				return { assessment: updatedAssessment, criteria: updatedCriteria };
			});
		}),

	updateSchedule: employeeProcedure
		.input(
			z
				.object({
					assessmentId: z.string().min(1),
					periodStart: dateInput,
					periodEnd: dateInput,
					criteriaDiscussionAt: dateInput,
					assessmentDate: dateInput,
					assessmentDiscussionAt: dateInput,
					dueAt: dateInput,
					reason: z.string().nullable().optional(),
				})
				.refine(
					(value) =>
						!value.periodStart ||
						!value.periodEnd ||
						value.periodStart <= value.periodEnd,
					{
						message: "The assessment period start must be before its end.",
						path: ["periodEnd"],
					},
				),
		)
		.mutation(async ({ input, ctx }) => {
			const assessment = await getAssessmentOrThrow(input.assessmentId);
			assertCanEditAssessment(assessment, ctx.user);
			const hasScheduleChange =
				(input.periodStart !== undefined &&
					input.periodStart?.getTime() !== assessment.periodStart?.getTime()) ||
				(input.periodEnd !== undefined &&
					input.periodEnd?.getTime() !== assessment.periodEnd?.getTime()) ||
				(input.criteriaDiscussionAt !== undefined &&
					input.criteriaDiscussionAt?.getTime() !==
						assessment.criteriaDiscussionAt?.getTime()) ||
				(input.assessmentDate !== undefined &&
					input.assessmentDate?.getTime() !==
						assessment.assessmentDate?.getTime()) ||
				(input.assessmentDiscussionAt !== undefined &&
					input.assessmentDiscussionAt?.getTime() !==
						assessment.assessmentDiscussionAt?.getTime()) ||
				(input.dueAt !== undefined &&
					input.dueAt?.getTime() !== assessment.dueAt?.getTime());
			if (hasScheduleChange && !input.reason?.trim()) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "A reason is required when changing assessment dates.",
				});
			}
			if (ctx.role === "Admin" && !input.reason?.trim()) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "An Admin correction requires a reason.",
				});
			}
			if (assessment.submittedAt && ctx.role !== "Admin") {
				throw new TRPCError({
					code: "PRECONDITION_FAILED",
					message:
						"Submitted assessment dates can only be corrected by an Admin.",
				});
			}
			const { assessmentId, reason, ...schedule } = input;
			return db.transaction(async (tx) => {
				const [updated] = await tx
					.update(assessments)
					.set(schedule)
					.where(eq(assessments.id, assessmentId))
					.returning();
				const fileSchedule = {
					...(schedule.criteriaDiscussionAt !== undefined && {
						criteriaDiscussionDate: schedule.criteriaDiscussionAt,
					}),
					...(schedule.assessmentDiscussionAt !== undefined && {
						assessmentDiscussionDate: schedule.assessmentDiscussionAt,
					}),
					...(schedule.periodStart !== undefined && {
						assessmentPeriodStart: schedule.periodStart,
					}),
					...(schedule.periodEnd !== undefined && {
						assessmentPeriodEnd: schedule.periodEnd,
					}),
				};
				if (Object.keys(fileSchedule).length > 0) {
					await tx
						.update(assessmentFiles)
						.set(fileSchedule)
						.where(eq(assessmentFiles.assessmentId, assessmentId));
				}
				await addHistory(
					tx,
					assessmentId,
					ctx.user.id,
					"date_changed",
					{
						periodStart: assessment.periodStart,
						periodEnd: assessment.periodEnd,
						criteriaDiscussionAt: assessment.criteriaDiscussionAt,
						assessmentDate: assessment.assessmentDate,
						dueAt: assessment.dueAt,
					},
					schedule,
					reason ?? undefined,
				);
				return updated;
			});
		}),

	updateForm: employeeProcedure
		.input(
			z.object({
				assessmentId: z.string().min(1),
				data: assessmentFileInput,
				reason: z.string().nullable().optional(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const assessment = await getAssessmentOrThrow(input.assessmentId);
			assertCanEditAssessment(assessment, ctx.user);
			if (ctx.role === "Admin" && !input.reason?.trim()) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "An Admin correction requires a reason.",
				});
			}
			if (assessment.submittedAt && ctx.role !== "Admin") {
				throw new TRPCError({
					code: "PRECONDITION_FAILED",
					message:
						"Submitted assessment data can only be corrected by an Admin.",
				});
			}
			const [current] = await db
				.select()
				.from(assessmentFiles)
				.where(eq(assessmentFiles.assessmentId, input.assessmentId))
				.limit(1);
			if (!current)
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Assessment form not found.",
				});

			return db.transaction(async (tx) => {
				const [updated] = await tx
					.update(assessmentFiles)
					.set(input.data)
					.where(eq(assessmentFiles.id, current.id))
					.returning();
				await addHistory(
					tx,
					input.assessmentId,
					ctx.user.id,
					"details_updated",
					current,
					updated,
					input.reason ?? undefined,
				);
				return updated;
			});
		}),

	updateCriteria: employeeProcedure
		.input(
			z.object({
				assessmentId: z.string().min(1),
				criteria: z.array(criteriaInput).min(1),
				reason: z.string().nullable().optional(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const assessment = await getAssessmentOrThrow(input.assessmentId);
			assertCanEditAssessment(assessment, ctx.user);
			if (ctx.role === "Admin" && !input.reason?.trim()) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "An Admin correction requires a reason.",
				});
			}
			if (assessment.submittedAt && ctx.role !== "Admin") {
				throw new TRPCError({
					code: "PRECONDITION_FAILED",
					message:
						"Submitted assessment data can only be corrected by an Admin.",
				});
			}
			const form = assessment.form;
			if (!form)
				throw new TRPCError({
					code: "PRECONDITION_FAILED",
					message: "Select an assessment form first.",
				});
			const [file] = await db
				.select()
				.from(assessmentFiles)
				.where(eq(assessmentFiles.assessmentId, input.assessmentId))
				.limit(1);
			if (!file)
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Assessment form not found.",
				});
			const [criteriaAcknowledgement] = await db
				.select()
				.from(assessmentAcknowledgements)
				.where(
					and(
						eq(assessmentAcknowledgements.assessmentId, input.assessmentId),
						eq(assessmentAcknowledgements.type, "criteria_participation"),
					),
				)
				.limit(1);
			if (criteriaAcknowledgement && ctx.role !== "Admin") {
				throw new TRPCError({
					code: "PRECONDITION_FAILED",
					message:
						"Criteria are locked after the participation acknowledgement.",
				});
			}

			const normalized = normalizeCriteria(form, input.criteria);
			const previous = await db
				.select()
				.from(assessmentFileCriteria)
				.where(eq(assessmentFileCriteria.assessmentFileId, file.id));
			return db.transaction(async (tx) => {
				await tx
					.delete(assessmentFileCriteria)
					.where(eq(assessmentFileCriteria.assessmentFileId, file.id));
				const updated = await tx
					.insert(assessmentFileCriteria)
					.values(
						normalized.map((criterion) => ({
							id: randomUUID(),
							assessmentFileId: file.id,
							...criterion,
						})),
					)
					.returning();
				await addHistory(
					tx,
					input.assessmentId,
					ctx.user.id,
					"criteria_updated",
					previous,
					updated,
					input.reason ?? undefined,
				);
				return updated;
			});
		}),

	rateCriteria: employeeProcedure
		.input(
			z.object({
				assessmentId: z.string().min(1),
				ratings: z
					.array(
						z.object({
							id: z.string().min(1),
							points: z
								.number()
								.int()
								.refine((points) =>
									(assessmentCriterionPoints as readonly number[]).includes(
										points,
									),
								),
							comment: z.string().nullable().optional(),
						}),
					)
					.min(1),
				reason: z.string().nullable().optional(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const assessment = await getAssessmentOrThrow(input.assessmentId);
			assertCanEditAssessment(assessment, ctx.user);
			if (ctx.role === "Admin" && !input.reason?.trim()) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "An Admin correction requires a reason.",
				});
			}
			if (assessment.submittedAt && ctx.role !== "Admin") {
				throw new TRPCError({
					code: "PRECONDITION_FAILED",
					message:
						"Submitted assessment ratings can only be corrected by an Admin.",
				});
			}
			const [criteriaAcknowledgement] = await db
				.select()
				.from(assessmentAcknowledgements)
				.where(
					and(
						eq(assessmentAcknowledgements.assessmentId, input.assessmentId),
						eq(assessmentAcknowledgements.type, "criteria_participation"),
						eq(assessmentAcknowledgements.status, "acknowledged"),
					),
				)
				.limit(1);
			if (!criteriaAcknowledgement) {
				throw new TRPCError({
					code: "PRECONDITION_FAILED",
					message:
						"The evaluated person must acknowledge criteria setting before ratings can be entered.",
				});
			}
			if (
				new Set(input.ratings.map((rating) => rating.id)).size !==
				input.ratings.length
			) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Each criterion may be rated only once per request.",
				});
			}
			const [file] = await db
				.select()
				.from(assessmentFiles)
				.where(eq(assessmentFiles.assessmentId, input.assessmentId))
				.limit(1);
			if (!file)
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Assessment form not found.",
				});
			const current = await db
				.select()
				.from(assessmentFileCriteria)
				.where(eq(assessmentFileCriteria.assessmentFileId, file.id));
			const criteriaIds = new Set(current.map((criterion) => criterion.id));
			if (input.ratings.some((rating) => !criteriaIds.has(rating.id))) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "A rating refers to a criterion outside this assessment.",
				});
			}
			const previous = current.filter((criterion) =>
				input.ratings.some((rating) => rating.id === criterion.id),
			);
			return db.transaction(async (tx) => {
				for (const rating of input.ratings) {
					await tx
						.update(assessmentFileCriteria)
						.set({
							points: rating.points,
							comment: rating.comment,
						})
						.where(eq(assessmentFileCriteria.id, rating.id));
				}
				const updated = await tx
					.select()
					.from(assessmentFileCriteria)
					.where(eq(assessmentFileCriteria.assessmentFileId, file.id));
				if (!assessment.submittedAt) {
					await tx
						.update(assessments)
						.set({ status: "assessment_in_progress" })
						.where(eq(assessments.id, input.assessmentId));
				}
				await addHistory(
					tx,
					input.assessmentId,
					ctx.user.id,
					"ratings_updated",
					previous,
					updated,
					input.reason ?? undefined,
				);
				return updated;
			});
		}),

	acknowledge: employeeProcedure
		.input(
			z.object({
				assessmentId: z.string().min(1),
				type: z.enum(acknowledgementTypes),
				location: z.string().nullable().optional(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const assessment = await getAssessmentOrThrow(input.assessmentId);
			if (ctx.user.id !== assessment.evaluatedUserId) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message:
						"Only the evaluated person can acknowledge participation or receipt.",
				});
			}
			if (
				input.type === "criteria_participation" &&
				assessment.status !== "criteria_setting"
			) {
				throw new TRPCError({
					code: "PRECONDITION_FAILED",
					message:
						"Criteria participation can only be acknowledged during criteria setting.",
				});
			}
			if (
				input.type === "criteria_participation" &&
				(!assessment.criteriaDiscussionAt || !assessment.assessmentDate)
			) {
				throw new TRPCError({
					code: "PRECONDITION_FAILED",
					message:
						"The criteria discussion date and planned assessment date must be set before acknowledgement.",
				});
			}
			if (input.type === "result_receipt" && !assessment.submittedAt) {
				throw new TRPCError({
					code: "PRECONDITION_FAILED",
					message:
						"The evaluator must submit the assessment before result receipt can be acknowledged.",
				});
			}
			const [existing] = await db
				.select()
				.from(assessmentAcknowledgements)
				.where(
					and(
						eq(assessmentAcknowledgements.assessmentId, input.assessmentId),
						eq(assessmentAcknowledgements.type, input.type),
					),
				)
				.limit(1);
			if (existing)
				throw new TRPCError({
					code: "CONFLICT",
					message: "This acknowledgement has already been recorded.",
				});

			return db.transaction(async (tx) => {
				const [acknowledgement] = await tx
					.insert(assessmentAcknowledgements)
					.values({
						id: randomUUID(),
						assessmentId: input.assessmentId,
						type: input.type,
						status: "acknowledged",
						actorUserId: ctx.user.id,
					})
					.returning();
				const nextStatus =
					input.type === "criteria_participation"
						? "ready_for_assessment"
						: "completed";
				await tx
					.update(assessments)
					.set({
						status: nextStatus,
						...(input.type === "result_receipt"
							? { completedAt: new Date() }
							: {}),
					})
					.where(eq(assessments.id, input.assessmentId));
				if (input.type === "result_receipt") {
					await tx
						.update(assessmentFiles)
						.set({
							employeeAcknowledgedAt: acknowledgement.acknowledgedAt,
							employeeReceiptName: ctx.user.name,
							employeeReceiptLocation: input.location,
						})
						.where(eq(assessmentFiles.assessmentId, input.assessmentId));
				} else {
					await tx
						.update(assessmentFiles)
						.set({
							criteriaDiscussionLocation: input.location,
							criteriaDiscussionEmployeeName: ctx.user.name,
						})
						.where(eq(assessmentFiles.assessmentId, input.assessmentId));
				}
				await addHistory(
					tx,
					input.assessmentId,
					ctx.user.id,
					"acknowledged",
					undefined,
					acknowledgement,
				);
				return acknowledgement;
			});
		}),

	recordUnacknowledgedReceipt: employeeProcedure
		.input(
			z.object({
				assessmentId: z.string().min(1),
				status: z.enum(["unable", "refused"]),
				explanation: z.string().min(1),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const assessment = await getAssessmentOrThrow(input.assessmentId);
			assertCanEditAssessment(assessment, ctx.user);
			if (!assessment.submittedAt)
				throw new TRPCError({
					code: "PRECONDITION_FAILED",
					message: "Submit the assessment before recording receipt.",
				});
			const [existing] = await db
				.select()
				.from(assessmentAcknowledgements)
				.where(
					and(
						eq(assessmentAcknowledgements.assessmentId, input.assessmentId),
						eq(assessmentAcknowledgements.type, "result_receipt"),
					),
				)
				.limit(1);
			if (existing)
				throw new TRPCError({
					code: "CONFLICT",
					message: "Result receipt has already been recorded.",
				});
			return db.transaction(async (tx) => {
				const [acknowledgement] = await tx
					.insert(assessmentAcknowledgements)
					.values({
						id: randomUUID(),
						assessmentId: input.assessmentId,
						type: "result_receipt",
						status: input.status,
						actorUserId: ctx.user.id,
						explanation: input.explanation,
					})
					.returning();
				await tx
					.update(assessments)
					.set({ status: "completed", completedAt: new Date() })
					.where(eq(assessments.id, input.assessmentId));
				await addHistory(
					tx,
					input.assessmentId,
					ctx.user.id,
					"acknowledged",
					undefined,
					acknowledgement,
					input.explanation,
				);
				return acknowledgement;
			});
		}),

	requestDateChange: employeeProcedure
		.input(
			z.object({
				assessmentId: z.string().min(1),
				proposedDate: z.coerce.date(),
				reason: z.string().min(1),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const assessment = await getAssessmentOrThrow(input.assessmentId);
			if (ctx.user.id !== assessment.evaluatedUserId) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Only the evaluated person can request a date change.",
				});
			}
			if (
				assessment.status === "completed" ||
				assessment.status === "cancelled"
			) {
				throw new TRPCError({
					code: "PRECONDITION_FAILED",
					message: "The assessment is no longer open for date changes.",
				});
			}
			return db.transaction(async (tx) => {
				const [request] = await tx
					.insert(assessmentDateChangeRequests)
					.values({
						id: randomUUID(),
						assessmentId: input.assessmentId,
						requestedByUserId: ctx.user.id,
						currentDate: assessment.assessmentDate,
						proposedDate: input.proposedDate,
						reason: input.reason,
					})
					.returning();
				await addHistory(
					tx,
					input.assessmentId,
					ctx.user.id,
					"date_change_requested",
					undefined,
					request,
					input.reason,
				);
				return request;
			});
		}),

	decideDateChange: employeeProcedure
		.input(
			z.object({
				requestId: z.string().min(1),
				status: z.enum(["approved", "rejected"]),
				decisionNote: z.string().trim().min(1),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const [request] = await db
				.select()
				.from(assessmentDateChangeRequests)
				.where(eq(assessmentDateChangeRequests.id, input.requestId))
				.limit(1);
			if (!request)
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Date change request not found.",
				});
			const assessment = await getAssessmentOrThrow(request.assessmentId);
			assertCanEditAssessment(assessment, ctx.user);
			if (request.status !== "pending")
				throw new TRPCError({
					code: "CONFLICT",
					message: "This date change request has already been decided.",
				});
			return db.transaction(async (tx) => {
				const [updatedRequest] = await tx
					.update(assessmentDateChangeRequests)
					.set({
						status: input.status,
						decidedByUserId: ctx.user.id,
						decidedAt: new Date(),
						decisionNote: input.decisionNote,
					})
					.where(eq(assessmentDateChangeRequests.id, input.requestId))
					.returning();
				if (input.status === "approved") {
					await tx
						.update(assessments)
						.set({ assessmentDate: request.proposedDate })
						.where(eq(assessments.id, request.assessmentId));
				}
				await addHistory(
					tx,
					request.assessmentId,
					ctx.user.id,
					"date_change_decided",
					{
						status: request.status,
						date: request.currentDate,
					},
					{
						status: input.status,
						date:
							input.status === "approved"
								? request.proposedDate
								: request.currentDate,
						decisionNote: input.decisionNote,
					},
					input.decisionNote ?? undefined,
				);
				return updatedRequest;
			});
		}),

	submit: employeeProcedure
		.input(
			z.object({
				assessmentId: z.string().min(1),
				rationale: z.string().nullable().optional(),
				reason: z.string().nullable().optional(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const assessment = await getAssessmentOrThrow(input.assessmentId);
			assertCanEditAssessment(assessment, ctx.user);
			if (ctx.role === "Admin" && !input.reason?.trim()) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "An Admin correction requires a reason.",
				});
			}
			if (assessment.submittedAt && ctx.role !== "Admin") {
				throw new TRPCError({
					code: "PRECONDITION_FAILED",
					message:
						"Submitted assessment data can only be corrected by an Admin.",
				});
			}
			if (
				assessment.status !== "assessment_in_progress" &&
				ctx.role !== "Admin"
			) {
				throw new TRPCError({
					code: "PRECONDITION_FAILED",
					message: "Start the assessment and enter ratings before submitting.",
				});
			}
			const [criteriaAcknowledgement] = await db
				.select()
				.from(assessmentAcknowledgements)
				.where(
					and(
						eq(assessmentAcknowledgements.assessmentId, input.assessmentId),
						eq(assessmentAcknowledgements.type, "criteria_participation"),
						eq(assessmentAcknowledgements.status, "acknowledged"),
					),
				)
				.limit(1);
			if (!criteriaAcknowledgement) {
				throw new TRPCError({
					code: "PRECONDITION_FAILED",
					message:
						"The evaluated person must acknowledge participation in criteria setting first.",
				});
			}
			const [file] = await db
				.select()
				.from(assessmentFiles)
				.where(eq(assessmentFiles.assessmentId, input.assessmentId))
				.limit(1);
			if (!file)
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Assessment form not found.",
				});
			if (!file.assessmentDiscussionDate) {
				throw new TRPCError({
					code: "PRECONDITION_FAILED",
					message: "Record the assessment discussion date before submitting.",
				});
			}
			const criteria = await db
				.select()
				.from(assessmentFileCriteria)
				.where(eq(assessmentFileCriteria.assessmentFileId, file.id));
			const points = criteria.flatMap((criterion) =>
				criterion.points === null ? [] : [criterion.points],
			);
			if (!criteria.length || points.length !== criteria.length) {
				throw new TRPCError({
					code: "PRECONDITION_FAILED",
					message:
						"Rate every mandatory and selected additional criterion before submitting.",
				});
			}
			const average = calculateAverage(points);
			const calculatedLevel =
				average < 2
					? "far_below_expectations"
					: average < 4
						? "below_expectations"
						: average < 6
							? "meets_expectations"
							: average < 8
								? "above_expectations"
								: "far_above_expectations";
			const calculatedOutcome = average >= 5 ? "positive" : "negative";
			const rationale = input.rationale ?? file.assessmentRationale;
			if (calculatedOutcome === "negative" && !rationale?.trim()) {
				throw new TRPCError({
					code: "PRECONDITION_FAILED",
					message: "A rationale is required for a negative assessment.",
				});
			}
			return db.transaction(async (tx) => {
				const [updatedFile] = await tx
					.update(assessmentFiles)
					.set({
						averagePoints: average,
						overallLevel: calculatedLevel,
						overallOutcome: calculatedOutcome,
						assessmentRationale: rationale,
						evaluatorSignedAt: new Date(),
						evaluatorSignatureLocation: file.evaluatorSignatureLocation,
					})
					.where(eq(assessmentFiles.id, file.id))
					.returning();
				const [updatedAssessment] = await tx
					.update(assessments)
					.set({
						status: "awaiting_employee_acknowledgement",
						submittedAt: new Date(),
						assessmentDiscussionAt: file.assessmentDiscussionDate,
					})
					.where(eq(assessments.id, input.assessmentId))
					.returning();
				await addHistory(
					tx,
					input.assessmentId,
					ctx.user.id,
					"submitted",
					assessment,
					{
						assessment: updatedAssessment,
						form: updatedFile,
					},
					input.reason ?? undefined,
				);
				return { assessment: updatedAssessment, file: updatedFile };
			});
		}),

	history: employeeProcedure
		.input(z.object({ assessmentId: z.string().min(1) }))
		.query(async ({ input, ctx }) => {
			const assessment = await getAssessmentOrThrow(input.assessmentId);
			assertCanViewAssessment(assessment, ctx.user);
			return db
				.select()
				.from(assessmentHistory)
				.where(eq(assessmentHistory.assessmentId, input.assessmentId))
				.orderBy(desc(assessmentHistory.createdAt));
		}),

	calculateResult: employeeProcedure
		.input(z.object({ assessmentId: z.string().min(1) }))
		.query(async ({ input, ctx }) => {
			const assessment = await getAssessmentOrThrow(input.assessmentId);
			assertCanViewAssessment(assessment, ctx.user);
			const [file] = await db
				.select()
				.from(assessmentFiles)
				.where(eq(assessmentFiles.assessmentId, input.assessmentId))
				.limit(1);
			if (!file)
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Assessment form not found.",
				});
			const criteria = await db
				.select()
				.from(assessmentFileCriteria)
				.where(eq(assessmentFileCriteria.assessmentFileId, file.id));
			if (
				!criteria.length ||
				criteria.some((criterion) => criterion.points === null)
			)
				throw new TRPCError({
					code: "PRECONDITION_FAILED",
					message: "Rate every criterion before calculating the result.",
				});
			const average = calculateAverage(
				criteria.map((criterion) => criterion.points!),
			);
			const overallLevel =
				average < 2
					? "far_below_expectations"
					: average < 4
						? "below_expectations"
						: average < 6
							? "meets_expectations"
							: average < 8
								? "above_expectations"
								: "far_above_expectations";
			return {
				average,
				overallLevel,
				overallOutcome:
					average >= 5 ? ("positive" as const) : ("negative" as const),
			};
		}),

	recordReviewOutcome: managerProcedure
		.input(
			z.object({
				assessmentId: z.string().min(1),
				outcome: z.enum(["change", "repeat"]),
				reason: z.string().trim().min(1),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const assessment = await getAssessmentOrThrow(input.assessmentId);
			if (ctx.role !== "Admin")
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Only an Admin can record a review decision.",
				});
			return db.transaction(async (tx) => {
				let replacement: typeof assessment | null = null;
				if (input.outcome === "repeat") {
					const [created] = await tx
						.insert(assessments)
						.values({
							id: randomUUID(),
							evaluatedUserId: assessment.evaluatedUserId,
							evaluatorUserId: assessment.evaluatorUserId,
							appointedByUserId: ctx.user.id,
							form: assessment.form,
							status: "criteria_setting",
							periodStart: assessment.periodStart,
							periodEnd: assessment.periodEnd,
							assessmentDate: assessment.assessmentDate,
							dueAt: assessment.dueAt,
						})
						.returning();
					replacement = created;
				}
				await addHistory(
					tx,
					input.assessmentId,
					ctx.user.id,
					"review_outcome_recorded",
					undefined,
					{
						outcome: input.outcome,
						replacementAssessmentId: replacement?.id ?? null,
					},
					input.reason,
				);
				return {
					recorded: true,
					replacementAssessmentId: replacement?.id ?? null,
				};
			});
		}),
} satisfies TRPCRouterRecord;

function getNextRequiredAction(
	assessment: typeof assessments.$inferSelect,
	acknowledgements: (typeof assessmentAcknowledgements.$inferSelect)[],
) {
	if (assessment.status === "cancelled" || assessment.status === "completed")
		return null;
	if (!acknowledgements.some((item) => item.type === "criteria_participation"))
		return "employee_criteria_acknowledgement" as const;
	if (!assessment.submittedAt) return "evaluator_complete_assessment" as const;
	if (!acknowledgements.some((item) => item.type === "result_receipt"))
		return "employee_result_acknowledgement" as const;
	return null;
}
