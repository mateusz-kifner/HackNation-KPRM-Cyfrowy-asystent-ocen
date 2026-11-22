import { randomUUID } from 'node:crypto'
import { and, desc, eq, isNull } from 'drizzle-orm'
import { z } from 'zod'
import type { TRPCRouterRecord } from '@trpc/server'
import { db } from '#/db'
import { notifications } from '#/db/schema'
import { protectedProcedure } from './init'

export async function createNotification(userId: string, title: string, message: string, href?: string) {
  return db.insert(notifications).values({ id: randomUUID(), userId, title, message, href }).returning().then(([item]) => item)
}

export const notificationsRouter = {
  list: protectedProcedure
    .input(z.object({ query: z.string().trim().max(100).optional() }).optional())
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id
      const items = await db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt)).limit(100)
      const query = input?.query?.toLocaleLowerCase()
      const visibleItems = query ? items.filter((item) => `${item.title} ${item.message} ${item.type}`.toLocaleLowerCase().includes(query)) : items
      return { items: visibleItems.map((item) => ({ ...item, read: item.readAt !== null })), unreadCount: items.filter((item) => item.readAt === null).length }
    }),
  markRead: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    await db.update(notifications).set({ readAt: new Date() }).where(and(eq(notifications.id, input.id), eq(notifications.userId, ctx.session.user.id), isNull(notifications.readAt)))
    return { success: true }
  }),
  markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
    await db.update(notifications).set({ readAt: new Date() }).where(and(eq(notifications.userId, ctx.session.user.id), isNull(notifications.readAt)))
    return { success: true }
  }),
} satisfies TRPCRouterRecord
