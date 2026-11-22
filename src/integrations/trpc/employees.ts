import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { adminProcedure, managerProcedure, protectedProcedure } from './init'
import { db } from '#/db'
import { employees } from '#/db/schema'
import { eq, like, or } from 'drizzle-orm'
import type { TRPCRouterRecord } from '@trpc/server'
import { randomUUID } from 'crypto'

const employeeSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  position: z.string(),
  department: z.string(),
  hireDate: z.number(),
})

export const employeesRouter = {
  list: managerProcedure
    .input(z.object({ query: z.string().trim().max(100).optional() }).optional())
    .query(async ({ input }) => {
    const search = input?.query
    const empList = await db.select().from(employees).where(search
      ? or(like(employees.name, `%${search}%`), like(employees.email, `%${search}%`), like(employees.position, `%${search}%`), like(employees.department, `%${search}%`))
      : undefined)
    return empList
  }),
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      if (ctx.session.user.id !== input.id && ctx.session.user.role !== 'Manager' && ctx.session.user.role !== 'Admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You may only view your own employee profile.' })
      }
      const [e] = await db.select().from(employees).where(eq(employees.id, input.id))
      return e
    }),
  create: managerProcedure
    .input(employeeSchema)
    .mutation(async ({ input }) => {
      const newEmp = {
        id: input.id || randomUUID(),
        name: input.name,
        email: input.email,
        position: input.position,
        department: input.department,
        hireDate: new Date(input.hireDate),
      }
      const [created] = await db.insert(employees).values(newEmp).returning()
      return created
    }),
  update: managerProcedure
    .input(employeeSchema.omit({ id: true }).extend({ id: z.string() }))
    .mutation(async ({ input }) => {
      const { id, hireDate, ...data } = input
      const [updated] = await db.update(employees).set({ ...data, hireDate: new Date(hireDate) }).where(eq(employees.id, id)).returning()
      return updated
    }),
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await db.delete(employees).where(eq(employees.id, input.id))
      return { success: true }
    }),
} satisfies TRPCRouterRecord
