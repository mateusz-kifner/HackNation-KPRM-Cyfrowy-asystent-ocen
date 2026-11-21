import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from './init'
import { db } from '#/db'
import { user } from '#/db/schema'
import { eq } from 'drizzle-orm'
import type { TRPCRouterRecord } from '@trpc/server'

const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(['admin', 'manager', 'normal']),
})

export const usersRouter = {
  list: publicProcedure.query(async () => {
    const users = await db.select().from(user)
    return users
  }),
  get: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const [u] = await db.select().from(user).where(eq(user.id, input.id))
      return u
    }),
  create: publicProcedure
    .input(userSchema)
    .mutation(async ({ input }) => {
      const [newUser] = await db.insert(user).values(input).returning()
      return newUser
    }),
  update: publicProcedure
    .input(z.object({ id: z.string(), ...userSchema.shape }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input
      const [updatedUser] = await db.update(user).set(data).where(eq(user.id, id)).returning()
      return updatedUser
    }),
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await db.delete(user).where(eq(user.id, input.id))
      return { success: true }
    }),
} satisfies TRPCRouterRecord
