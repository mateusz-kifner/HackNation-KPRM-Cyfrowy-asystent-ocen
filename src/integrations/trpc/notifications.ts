import { z } from "zod";
import { protectedProcedure } from "./init";
import type { TRPCRouterRecord } from "@trpc/server";

type Notification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  read: boolean;
  createdAt: Date;
  meta?: Record<string, unknown>;
};

// Simple in-memory store. Replace with DB in production.
const store = new Map<string, Notification[]>();

function getUserNotifications(userId: string) {
  if (!store.has(userId)) {
    // Seed with demo notifications
    store.set(userId, [
      {
        id: "n1",
        userId,
        title: "Welcome",
        message: "Welcome to BlueVoid! Check your profile.",
        type: "success",
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30),
      },
      {
        id: "n2",
        userId,
        title: "Assessment due",
        message: "Your quarterly assessment is due in 3 days.",
        type: "warning",
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
      },
      {
        id: "n3",
        userId,
        title: "New message",
        message: "Manager left a comment on your evaluation.",
        type: "info",
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      },
    ]);
  }
  return store.get(userId)!;
}

export const notificationsRouter = {
  list: protectedProcedure
    .input(z.object({ query: z.string().trim().max(100).optional() }).optional())
    .query(({ ctx, input }) => {
    const userId = ctx.session.user.id;
    const items = getUserNotifications(userId);
    const query = input?.query?.toLocaleLowerCase();
    const visibleItems = query
      ? items.filter((n) => `${n.title} ${n.message} ${n.type}`.toLocaleLowerCase().includes(query))
      : items;
    return { items: visibleItems, unreadCount: items.filter((n) => !n.read).length };
  }),
  markRead: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const items = getUserNotifications(userId);
      const n = items.find((x) => x.id === input.id);
      if (n) n.read = true;
      return { success: true };
    }),
  markAllRead: protectedProcedure.mutation(({ ctx }) => {
    const userId = ctx.session.user.id;
    const items = getUserNotifications(userId);
    items.forEach((n) => (n.read = true));
    return { success: true };
  }),
  create: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        message: z.string(),
        type: z.enum(["info", "warning", "success", "error"]).optional(),
      })
    )
    .mutation(({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const items = getUserNotifications(userId);
      const n: Notification = {
        id: `n${Date.now()}`,
        userId,
        title: input.title,
        message: input.message,
        type: input.type ?? "info",
        read: false,
        createdAt: new Date(),
      };
      items.unshift(n);
      return n;
    }),
} satisfies TRPCRouterRecord;
