import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { db } from '#/db'
import { user } from '#/db/schema'
import { eq } from 'drizzle-orm'

describe('users router', () => {
  const testUser = {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    role: 'normal' as const,
  }

  beforeAll(async () => {
    await db.delete(user).where(eq(user.id, testUser.id))
  })

  afterAll(async () => {
    await db.delete(user).where(eq(user.id, testUser.id))
  })

  it('should list users', async () => {
    const users = await db.select().from(user)
    expect(Array.isArray(users)).toBe(true)
  })

  it('should create a user', async () => {
    const [newUser] = await db.insert(user).values(testUser).returning()
    expect(newUser.id).toBe(testUser.id)
    expect(newUser.name).toBe(testUser.name)
    expect(newUser.email).toBe(testUser.email)
    expect(newUser.role).toBe(testUser.role)
  })

  it('should get a user', async () => {
    const [result] = await db.select().from(user).where(eq(user.id, testUser.id))
    expect(result?.id).toBe(testUser.id)
  })

  it('should update a user', async () => {
    const updatedName = 'Updated Test User'
    const [result] = await db.update(user).set({ name: updatedName, role: 'manager' }).where(eq(user.id, testUser.id)).returning()
    expect(result.name).toBe(updatedName)
    expect(result.role).toBe('manager')
  })

  it('should delete a user', async () => {
    await db.delete(user).where(eq(user.id, testUser.id))
    
    const [deleted] = await db.select().from(user).where(eq(user.id, testUser.id))
    expect(deleted).toBeUndefined()
  })
})
