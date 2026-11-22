import { randomUUID } from 'node:crypto'
import { and, desc, eq, gte, isNull, lte, ne, or } from 'drizzle-orm'
import { z } from 'zod'
import type { TRPCRouterRecord } from '@trpc/server'
import { db } from '#/db'
import { assessments, notifications } from '#/db/schema'
import { protectedProcedure } from './init'

export async function createNotification(userId: string, title: string, message: string, href?: string) {
  return db.insert(notifications).values({ id: randomUUID(), userId, title, message, href }).returning().then(([item]) => item)
}

export const notificationsRouter = {
  list: protectedProcedure
    .input(z.object({ query: z.string().trim().max(100).optional() }).optional())
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id
      const now = new Date()
      const reminderWindow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
      const upcoming = await db.select({ id: assessments.id, dueAt: assessments.dueAt })
        .from(assessments)
        .where(and(
          or(eq(assessments.evaluatedUserId, userId), eq(assessments.evaluatorUserId, userId)),
          ne(assessments.status, 'completed'),
          ne(assessments.status, 'cancelled'),
          gte(assessments.dueAt, now),
          lte(assessments.dueAt, reminderWindow),
        ))
      for (const assessment of upcoming) {
        const href = `/evaluation/${assessment.id}`
        const [existing] = await db.select({ id: notifications.id }).from(notifications)
          .where(and(eq(notifications.userId, userId), eq(notifications.title, 'Assessment reminder'), eq(notifications.href, href)))
          .limit(1)
        if (!existing) {
          await createNotification(userId, 'Assessment reminder', `An assessment step is due by ${assessment.dueAt?.toLocaleDateString() ?? 'soon'}.`, href)
        }
      }
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
