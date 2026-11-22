import { z } from 'zod'

import { createTRPCRouter, protectedProcedure } from './init'

import type { TRPCRouterRecord } from '@trpc/server'
import { usersRouter } from './users'
import { filesRouter } from './files'
import { employeesRouter } from './employees'
import { evaluationsRouter } from './evaluations'
import { meRouter } from './me'
import { notificationsRouter } from './notifications'
import { hrOperationsRouter } from './hr-operations'
import { schedulerRouter } from './scheduler'

const todos = [
  { id: 1, name: 'Get groceries' },
  { id: 2, name: 'Buy a new phone' },
  { id: 3, name: 'Finish the project' },
]

const todosRouter = {
  list: protectedProcedure
    .input(z.object({ query: z.string().trim().max(100).optional() }).optional())
    .query(({ input }) => input?.query
      ? todos.filter((todo) => todo.name.toLocaleLowerCase().includes(input.query!.toLocaleLowerCase()))
      : todos),
  add: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(({ input }) => {
      const newTodo = { id: todos.length + 1, name: input.name }
      todos.push(newTodo)
      return newTodo
    }),
} satisfies TRPCRouterRecord

export const trpcRouter = createTRPCRouter({
  todos: todosRouter,
  users: usersRouter,
  files: filesRouter,
  employees: employeesRouter,
  evaluations: evaluationsRouter,
  me: meRouter,
  notifications: notificationsRouter,
  hr: hrOperationsRouter,
  scheduler: schedulerRouter,
})
export type TRPCRouter = typeof trpcRouter
