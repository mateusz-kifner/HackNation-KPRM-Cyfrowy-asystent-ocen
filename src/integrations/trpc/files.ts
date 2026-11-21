import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from './init'
import { db } from '#/db'
import { files } from '#/db/schema'
import { eq } from 'drizzle-orm'
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
  list: publicProcedure.query(async () => {
    const fileList = await db.select().from(files)
    return fileList
  }),
  get: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const [f] = await db.select().from(files).where(eq(files.id, input.id))
      return f
    }),
  create: publicProcedure
    .input(fileSchema)
    .mutation(async ({ input }) => {
      const newFile = {
        id: input.id || randomUUID(),
        name: input.name,
        size: input.size,
        mimeType: input.mimeType,
        url: input.url,
        userId: input.userId,
      }
      const [created] = await db.insert(files).values(newFile).returning()
      return created
    }),
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await db.delete(files).where(eq(files.id, input.id))
      return { success: true }
    }),
} satisfies TRPCRouterRecord
