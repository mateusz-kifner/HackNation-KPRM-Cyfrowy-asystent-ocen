import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { db } from '#/db'
import { employees } from '#/db/schema'
import { eq } from 'drizzle-orm'

describe('employees schema', () => {
  const testEmployee = {
    id: 'test-employee-id',
    name: 'John Doe',
    email: 'john@example.com',
    position: 'Developer',
    department: 'Engineering',
    hireDate: new Date(),
  }

  beforeAll(async () => {
    await db.delete(employees).where(eq(employees.id, testEmployee.id))
  })

  afterAll(async () => {
    await db.delete(employees).where(eq(employees.id, testEmployee.id))
  })

  it('should list employees', async () => {
    const empList = await db.select().from(employees)
    expect(Array.isArray(empList)).toBe(true)
  })

  it('should create an employee', async () => {
    const [newEmp] = await db.insert(employees).values(testEmployee).returning()
    expect(newEmp.id).toBe(testEmployee.id)
    expect(newEmp.name).toBe(testEmployee.name)
    expect(newEmp.email).toBe(testEmployee.email)
    expect(newEmp.position).toBe(testEmployee.position)
    expect(newEmp.department).toBe(testEmployee.department)
  })

  it('should get an employee', async () => {
    const [result] = await db.select().from(employees).where(eq(employees.id, testEmployee.id))
    expect(result?.id).toBe(testEmployee.id)
  })

  it('should update an employee', async () => {
    const [updated] = await db.update(employees).set({ name: 'Jane Doe' }).where(eq(employees.id, testEmployee.id)).returning()
    expect(updated.name).toBe('Jane Doe')
  })

  it('should delete an employee', async () => {
    await db.delete(employees).where(eq(employees.id, testEmployee.id))
    const [deleted] = await db.select().from(employees).where(eq(employees.id, testEmployee.id))
    expect(deleted).toBeUndefined()
  })
})
