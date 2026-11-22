import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { adminProcedure, protectedProcedure, publicProcedure } from "./init";
import { db } from "#/db";
import { account, session, user, userAuditLog } from "#/db/schema";
import { eq, like, or } from "drizzle-orm";
import type { TRPCRouterRecord } from "@trpc/server";
import { hashPassword } from "better-auth/crypto";
import { randomUUID } from "crypto";

const profileSchema = z.object({
	name: z.string(),
	email: z.string().email(),
	role: z.enum(["Employee", "Manager", "Admin"]),
	position: z.string().nullable().optional(),
	department: z.string().nullable().optional(),
	organizationalUnit: z.string().nullable().optional(),
	employmentStatus: z.string().nullable().optional(),
	employmentType: z.string().nullable().optional(),
	hireDate: z.coerce.date().nullable().optional(),
});

function changedProfile(data: Record<string, unknown>, before: Record<string, unknown>) {
	return Object.fromEntries(Object.keys(data).map((key) => [key, { before: before[key] ?? null, after: data[key] ?? null }]));
}

export const usersRouter = {
	loginOptions: publicProcedure.query(async () =>
		db.select({ id: user.id, name: user.name, email: user.email }).from(user),
	),
	list: adminProcedure
		.input(z.object({ query: z.string().trim().max(100).optional() }).optional())
		.query(async ({ input }) => {
			const query = input?.query;
			return db.select().from(user).where(query
				? or(like(user.name, `%${query}%`), like(user.email, `%${query}%`), like(user.role, `%${query}%`), like(user.position, `%${query}%`), like(user.department, `%${query}%`))
				: undefined);
		}),
	search: adminProcedure
		.input(z.object({ query: z.string().trim().min(1).max(100) }))
		.query(async ({ input }) => {
			const pattern = `%${input.query}%`;
			return db
				.select({ id: user.id, name: user.name, email: user.email, role: user.role })
				.from(user)
				.where(or(like(user.name, pattern), like(user.email, pattern)))
				.limit(20);
		}),
	get: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ input, ctx }) => {
			const [u] = await db.select().from(user).where(eq(user.id, input.id));
			if (ctx.session.user.id === input.id || ctx.session.user.role === "Admin")
				return u;
			if (ctx.session.user.role === "Manager" && u?.role === "Employee")
				return u;
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "You may only view your own account or an Employee account.",
			});
		}),
	create: adminProcedure
		.input(profileSchema.extend({ password: z.string().min(8) }))
		.mutation(async ({ input }) => {
			const { password, ...profile } = input;
			const id = randomUUID();
			const hashedPassword = await hashPassword(password);
			const newUser = db.transaction((tx) => {
				const [created] = tx
					.insert(user)
					.values({
						id,
						...profile,
						emailVerified: false,
						isAnonymous: false,
					})
					.returning();
				tx.insert(account).values({
					id: randomUUID(),
					accountId: id,
					providerId: "credential",
					userId: id,
					password: hashedPassword,
				});
				return created;
			});
			return newUser;
		}),
	update: adminProcedure
		.input(profileSchema.partial().extend({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			const { id, ...data } = input;
			const [before] = await db.select().from(user).where(eq(user.id, id));
			if (!before) throw new TRPCError({ code: "NOT_FOUND" });
			const [updatedUser] = db.transaction((tx) => {
				const [updated] = tx.update(user).set(data).where(eq(user.id, id)).returning();
				tx.insert(userAuditLog).values({ id: randomUUID(), userId: id, actorId: ctx.session.user.id, action: "updated", changes: JSON.stringify(changedProfile(data, before)) });
				return [updated];
			});
			return updatedUser;
		}),
	delete: adminProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			if (input.id === ctx.session.user.id) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "You cannot delete your own account.",
				});
			}
			const [target] = await db.select().from(user).where(eq(user.id, input.id));
			if (!target) throw new TRPCError({ code: "NOT_FOUND" });
			db.transaction((tx) => {
				tx.update(user).set({ deactivatedAt: new Date() }).where(eq(user.id, input.id));
				tx.delete(session).where(eq(session.userId, input.id));
				tx.insert(userAuditLog).values({ id: randomUUID(), userId: input.id, actorId: ctx.session.user.id, action: "deactivated", changes: JSON.stringify({ deactivatedAt: new Date().toISOString() }) });
			});
			return { success: true };
		}),
} satisfies TRPCRouterRecord;
