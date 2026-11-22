import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { db } from "#/db";
import { assessments, user } from "#/db/schema";

export type AuthenticatedUser = {
	id: string;
	role: string;
};

export async function getAssessmentOrThrow(assessmentId: string) {
	const [assessment] = await db
		.select()
		.from(assessments)
		.where(eq(assessments.id, assessmentId))
		.limit(1);

	if (!assessment) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: "Assessment not found.",
		});
	}

	return assessment;
}

export function assertCanViewAssessment(
	assessment: typeof assessments.$inferSelect,
	actor: AuthenticatedUser,
) {
	if (
		actor.role === "Admin" ||
		actor.role === "Manager" ||
		actor.id === assessment.evaluatorUserId ||
		actor.id === assessment.evaluatedUserId
	) {
		return;
	}

	throw new TRPCError({
		code: "FORBIDDEN",
		message: "You cannot view this assessment.",
	});
}

export function assertCanEditAssessment(
	assessment: typeof assessments.$inferSelect,
	actor: AuthenticatedUser,
) {
	if (actor.role === "Admin" || actor.id === assessment.evaluatorUserId) return;

	throw new TRPCError({
		code: "FORBIDDEN",
		message:
			"Only the assigned evaluator or an Admin can edit this assessment.",
	});
}

export async function assertUserExists(userId: string) {
	const [candidate] = await db
		.select({ id: user.id })
		.from(user)
		.where(eq(user.id, userId))
		.limit(1);

	if (!candidate) {
		throw new TRPCError({ code: "NOT_FOUND", message: "User not found." });
	}
}

export function assertManagerOrAdmin(actor: AuthenticatedUser) {
	if (actor.role === "Manager" || actor.role === "Admin") return;
	throw new TRPCError({
		code: "FORBIDDEN",
		message: "Only a Manager or Admin can perform this action.",
	});
}
