import { z } from "zod";
import { protectedProcedure } from "./init";
import { db } from "#/db";
import { user } from "#/db/schema";
import { eq } from "drizzle-orm";
import type { TRPCRouterRecord } from "@trpc/server";

export const meRouter = {
  get: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const [u] = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        position: user.position,
        department: user.department,
        organizationalUnit: user.organizationalUnit,
        employmentStatus: user.employmentStatus,
        employmentType: user.employmentType,
        hireDate: user.hireDate,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })
      .from(user)
      .where(eq(user.id, userId));
    return u;
  }),
  update: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        position: z.string().nullable().optional(),
        department: z.string().nullable().optional(),
        organizationalUnit: z.string().nullable().optional(),
        employmentStatus: z.string().nullable().optional(),
        employmentType: z.string().nullable().optional(),
        hireDate: z.coerce.date().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const [updated] = await db
        .update(user)
        .set(input)
        .where(eq(user.id, userId))
        .returning();
      return updated;
    }),
} satisfies TRPCRouterRecord;
