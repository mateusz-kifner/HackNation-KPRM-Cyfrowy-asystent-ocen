import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { db } from '#/db'
import { files } from '#/db/schema'
import { eq } from 'drizzle-orm'

describe('files schema', () => {
  const testFile = {
    id: 'test-file-id',
    name: 'test.txt',
    size: 1024,
    mimeType: 'text/plain',
    url: 'http://example.com/test.txt',
  }

  beforeAll(async () => {
    await db.delete(files).where(eq(files.id, testFile.id))
  })

  afterAll(async () => {
    await db.delete(files).where(eq(files.id, testFile.id))
  })

  it('should list files', async () => {
    const fileList = await db.select().from(files)
    expect(Array.isArray(fileList)).toBe(true)
  })

  it('should create a file', async () => {
    const [newFile] = await db.insert(files).values(testFile).returning()
    expect(newFile.id).toBe(testFile.id)
    expect(newFile.name).toBe(testFile.name)
    expect(newFile.size).toBe(testFile.size)
    expect(newFile.mimeType).toBe(testFile.mimeType)
    expect(newFile.url).toBe(testFile.url)
  })

  it('should get a file', async () => {
    const [result] = await db.select().from(files).where(eq(files.id, testFile.id))
    expect(result?.id).toBe(testFile.id)
  })

  it('should delete a file', async () => {
    await db.delete(files).where(eq(files.id, testFile.id))
    const [deleted] = await db.select().from(files).where(eq(files.id, testFile.id))
    expect(deleted).toBeUndefined()
  })
})
