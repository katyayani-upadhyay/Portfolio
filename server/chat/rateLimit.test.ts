import { describe, expect, it } from 'vitest'
import { clientKey, DailyBudget, SlidingWindowLimiter } from './rateLimit'

describe('SlidingWindowLimiter', () => {
  it('allows up to the limit, then blocks until the window slides', () => {
    let t = 1_000_000
    const limiter = new SlidingWindowLimiter(3, 60_000, () => t)
    expect(limiter.check('ip').allowed).toBe(true)
    expect(limiter.check('ip').allowed).toBe(true)
    expect(limiter.check('ip').allowed).toBe(true)
    const blocked = limiter.check('ip')
    expect(blocked.allowed).toBe(false)
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0)
    expect(blocked.retryAfterSeconds).toBeLessThanOrEqual(60)
    t += 60_001
    expect(limiter.check('ip').allowed).toBe(true)
  })

  it('keeps callers independent', () => {
    const limiter = new SlidingWindowLimiter(1, 60_000, () => 0)
    expect(limiter.check('a').allowed).toBe(true)
    expect(limiter.check('b').allowed).toBe(true)
    expect(limiter.check('a').allowed).toBe(false)
  })
})

describe('DailyBudget', () => {
  it('resets when the UTC day changes', () => {
    let t = Date.UTC(2026, 8, 10, 23, 59, 0)
    const budget = new DailyBudget(2, () => t)
    expect(budget.take()).toBe(true)
    expect(budget.take()).toBe(true)
    expect(budget.take()).toBe(false)
    t += 2 * 60_000
    expect(budget.take()).toBe(true)
  })
})

describe('clientKey', () => {
  it('prefers the first forwarded address', () => {
    const req = new Request('http://t/', { headers: { 'x-forwarded-for': '203.0.113.9, 10.0.0.1' } })
    expect(clientKey(req)).toBe('203.0.113.9')
  })

  it('falls back to x-real-ip and then a constant', () => {
    expect(clientKey(new Request('http://t/', { headers: { 'x-real-ip': '198.51.100.2' } }))).toBe('198.51.100.2')
    expect(clientKey(new Request('http://t/'))).toBe('anonymous')
  })
})
