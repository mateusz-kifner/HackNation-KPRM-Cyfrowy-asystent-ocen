import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from './init'
import { db } from '#/db'
import { employees } from '#/db/schema'
import { eq } from 'drizzle-orm'
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
  list: publicProcedure.query(async () => {
    const empList = await db.select().from(employees)
    return empList
  }),
  get: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const [e] = await db.select().from(employees).where(eq(employees.id, input.id))
      return e
    }),
  create: publicProcedure
    .input(employeeSchema)
    .mutation(async ({ input }) => {
      const newEmp = {
        id: input.id || randomUUID(),
        name: input.name,
        email: input.email,
        position: input.position,
        department: input.department,
        hireDate: input.hireDate,
      }
      const [created] = await db.insert(employees).values(newEmp).returning()
      return created
    }),
  update: publicProcedure
    .input(z.object({ id: z.string(), ...employeeSchema.shape }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input
      const [updated] = await db.update(employees).set(data).where(eq(employees.id, id)).returning()
      return updated
    }),
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await db.delete(employees).where(eq(employees.id, input.id))
      return { success: true }
    }),
} satisfies TRPCRouterRecord
