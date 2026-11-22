import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { protectedProcedure } from './init'
import { db } from '#/db'
import { files } from '#/db/schema'
import { and, eq, like, or } from 'drizzle-orm'
import type { TRPCRouterRecord } from '@trpc/server'
import { randomUUID } from 'crypto'

const fileSchema = z.object({
  id: z.string(),
  name: z.string(),
  size: z.number(),
  mimeType: z.string(),
  url: z.string(),
  userId: z.string().optional(),
})

export const filesRouter = {
  list: protectedProcedure
    .input(z.object({ query: z.string().trim().max(100).optional() }).optional())
    .query(async ({ ctx, input }) => {
    const search = input?.query
    const visibility = ctx.session.user.role === 'Admin' ? undefined : eq(files.userId, ctx.session.user.id)
    const matches = search ? or(like(files.name, `%${search}%`), like(files.mimeType, `%${search}%`)) : undefined
    const fileList = await db.select().from(files).where(and(visibility, matches))
    return fileList
  }),
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const [f] = await db.select().from(files).where(eq(files.id, input.id))
      if (f && f.userId !== ctx.session.user.id && ctx.session.user.role !== 'Admin') {
        throw new TRPCError({ code: 'FORBIDDEN' })
      }
      return f
    }),
  create: protectedProcedure
    .input(fileSchema)
    .mutation(async ({ input, ctx }) => {
      if (input.userId && input.userId !== ctx.session.user.id && ctx.session.user.role !== 'Admin') {
        throw new TRPCError({ code: 'FORBIDDEN' })
      }
      const newFile = {
        id: input.id || randomUUID(),
        name: input.name,
        size: input.size,
        mimeType: input.mimeType,
        url: input.url,
        userId: ctx.session.user.role === 'Admin' ? input.userId ?? ctx.session.user.id : ctx.session.user.id,
      }
      const [created] = await db.insert(files).values(newFile).returning()
      return created
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const [file] = await db.select().from(files).where(eq(files.id, input.id))
      if (!file) return { success: true }
      if (file.userId !== ctx.session.user.id && ctx.session.user.role !== 'Admin') {
        throw new TRPCError({ code: 'FORBIDDEN' })
      }
      await db.delete(files).where(eq(files.id, input.id))
      return { success: true }
    }),
} satisfies TRPCRouterRecord
