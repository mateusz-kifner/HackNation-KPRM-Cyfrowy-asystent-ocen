import { randomUUID } from 'node:crypto'
import { eq, or } from 'drizzle-orm'
import { TRPCError, type TRPCRouterRecord } from '@trpc/server'
import { z } from 'zod'
import { db } from '#/db'
import { absences, actingSubstitutions, reportingLines, user } from '#/db/schema'
import { managerProcedure } from './init'

const interval = z.object({ startsAt: z.coerce.date(), endsAt: z.coerce.date().nullable().optional() }).refine((v) => !v.endsAt || v.startsAt <= v.endsAt, 'End date must be after start date.')
async function assertUsersExist(ids: string[]) {
  const found = await db.select({ id: user.id }).from(user).where(or(...ids.map((id) => eq(user.id, id))))
  if (found.length !== new Set(ids).size) throw new TRPCError({ code: 'NOT_FOUND', message: 'One or more users were not found.' })
}

export const hrOperationsRouter = {
  reportingLines: managerProcedure.query(() => db.select().from(reportingLines)),
  setReportingLine: managerProcedure.input(interval.extend({ employeeUserId: z.string(), managerUserId: z.string() })).mutation(async ({ input, ctx }) => {
    if (input.employeeUserId === input.managerUserId) throw new TRPCError({ code: 'BAD_REQUEST', message: 'A user cannot report to themself.' })
    await assertUsersExist([input.employeeUserId, input.managerUserId])
    return db.insert(reportingLines).values({ id: randomUUID(), ...input, createdByUserId: ctx.user.id }).returning().then(([row]) => row)
  }),
  deleteReportingLine: managerProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
    await db.delete(reportingLines).where(eq(reportingLines.id, input.id)); return { success: true }
  }),
  substitutions: managerProcedure.query(() => db.select().from(actingSubstitutions)),
  setSubstitution: managerProcedure.input(interval.extend({ substituteUserId: z.string(), representedUserId: z.string(), scope: z.string().trim().min(1) })).mutation(async ({ input, ctx }) => {
    if (input.substituteUserId === input.representedUserId) throw new TRPCError({ code: 'BAD_REQUEST', message: 'A user cannot substitute for themself.' })
    await assertUsersExist([input.substituteUserId, input.representedUserId])
    return db.insert(actingSubstitutions).values({ id: randomUUID(), ...input, createdByUserId: ctx.user.id }).returning().then(([row]) => row)
  }),
  deleteSubstitution: managerProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
    await db.delete(actingSubstitutions).where(eq(actingSubstitutions.id, input.id)); return { success: true }
  }),
  absences: managerProcedure.input(z.object({ userId: z.string().optional() }).optional()).query(({ input }) => db.select().from(absences).where(input?.userId ? eq(absences.userId, input.userId) : undefined)),
  recordAbsence: managerProcedure.input(z.object({ userId: z.string(), startsAt: z.coerce.date(), endsAt: z.coerce.date(), continuous: z.boolean().default(false), reason: z.string().trim().max(1000).optional() }).refine((v) => v.startsAt <= v.endsAt, 'End date must be after start date.')).mutation(async ({ input, ctx }) => {
    await assertUsersExist([input.userId])
    return db.insert(absences).values({ id: randomUUID(), ...input, recordedByUserId: ctx.user.id }).returning().then(([row]) => row)
  }),
  deleteAbsence: managerProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
    await db.delete(absences).where(eq(absences.id, input.id)); return { success: true }
  }),
} satisfies TRPCRouterRecord
