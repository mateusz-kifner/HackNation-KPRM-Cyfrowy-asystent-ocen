import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('utils', () => {
  it('should merge class names', () => {
    const result = cn('foo', 'bar', { baz: true })
    expect(result).toContain('foo')
    expect(result).toContain('bar')
    expect(result).toContain('baz')
  })

  it('should handle empty inputs', () => {
    const result = cn()
    expect(result).toBe('')
  })
})
