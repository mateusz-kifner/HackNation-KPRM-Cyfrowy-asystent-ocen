import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { adminProcedure, protectedProcedure, managerProcedure } from './init'
import { db } from '#/db'
import { account, user } from '#/db/schema'
import { eq } from 'drizzle-orm'
import type { TRPCRouterRecord } from '@trpc/server'
import { hashPassword } from 'better-auth/crypto'
import { randomUUID } from 'crypto'

const profileSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  role: z.enum(['Employee', 'Manager', 'Admin']),
  position: z.string().nullable().optional(),
  department: z.string().nullable().optional(),
  organizationalUnit: z.string().nullable().optional(),
  employmentStatus: z.string().nullable().optional(),
  employmentType: z.string().nullable().optional(),
  hireDate: z.coerce.date().nullable().optional(),
})

export const usersRouter = {
  list: managerProcedure.query(async ({ ctx }) => {
    const users = await db.select().from(user)
    return ctx.role === 'Admin' ? users : users.filter((record) => record.role === 'Employee')
  }),
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const [u] = await db.select().from(user).where(eq(user.id, input.id))
      if (ctx.session.user.id === input.id || ctx.session.user.role === 'Admin') return u
      if (ctx.session.user.role === 'Manager' && u?.role === 'Employee') return u
      throw new TRPCError({ code: 'FORBIDDEN', message: 'You may only view your own account or an Employee account.' })
    }),
  create: adminProcedure
    .input(profileSchema.extend({ password: z.string().min(8) }))
    .mutation(async ({ input }) => {
      const { password, ...profile } = input
      const id = randomUUID()
      const hashedPassword = await hashPassword(password)
      const newUser = await db.transaction(async (tx) => {
        const [created] = await tx.insert(user).values({
          id,
          ...profile,
          emailVerified: false,
          isAnonymous: false,
        }).returning()
        await tx.insert(account).values({
          id: randomUUID(),
          accountId: id,
          providerId: 'credential',
          userId: id,
          password: hashedPassword,
        })
        return created
      })
      return newUser
    }),
  update: adminProcedure
    .input(profileSchema.partial().extend({ id: z.string() }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input
      const [updatedUser] = await db.update(user).set(data).where(eq(user.id, id)).returning()
      return updatedUser
    }),
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (input.id === ctx.session.user.id) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'You cannot delete your own account.' })
      }
      await db.delete(user).where(eq(user.id, input.id))
      return { success: true }
    }),
} satisfies TRPCRouterRecord
