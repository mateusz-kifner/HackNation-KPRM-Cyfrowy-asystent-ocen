import { z } from 'zod'

import { createTRPCRouter, protectedProcedure } from './init'

import type { TRPCRouterRecord } from '@trpc/server'
import { usersRouter } from './users'
import { filesRouter } from './files'
import { employeesRouter } from './employees'
import { evaluationsRouter } from './evaluations'

const todos = [
  { id: 1, name: 'Get groceries' },
  { id: 2, name: 'Buy a new phone' },
  { id: 3, name: 'Finish the project' },
]

const todosRouter = {
  list: protectedProcedure.query(() => todos),
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
})
export type TRPCRouter = typeof trpcRouter
