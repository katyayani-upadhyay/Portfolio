import { describe, expect, it } from 'vitest'
import { clientKey, DailyBudget, TokenBucketLimiter } from './rateLimit'

describe('TokenBucketLimiter', () => {
  it('lets a visitor tap several chips in quick succession', () => {
    let t = 1_000_000
    const limiter = new TokenBucketLimiter(5, 6, () => t)
    for (let i = 0; i < 3; i++) {
      expect(limiter.check('ip').allowed).toBe(true)
      t += 10_000 // three requests in 30 seconds
    }
  })

  it('allows the full burst, then blocks with a retry-after until a token refills', () => {
    let t = 0
    const limiter = new TokenBucketLimiter(5, 6, () => t)
    for (let i = 0; i < 6; i++) expect(limiter.check('ip').allowed).toBe(true)
    const blocked = limiter.check('ip')
    expect(blocked.allowed).toBe(false)
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0)
    expect(blocked.retryAfterSeconds).toBeLessThanOrEqual(12)
    t += 12_000 // one token refills every 60s / 5
    expect(limiter.check('ip').allowed).toBe(true)
    expect(limiter.check('ip').allowed).toBe(false)
  })

  it('refills back up to the burst capacity, never beyond', () => {
    let t = 0
    const limiter = new TokenBucketLimiter(5, 6, () => t)
    for (let i = 0; i < 6; i++) limiter.check('ip')
    t += 10 * 60_000
    for (let i = 0; i < 6; i++) expect(limiter.check('ip').allowed).toBe(true)
    expect(limiter.check('ip').allowed).toBe(false)
  })

  it('keeps callers independent', () => {
    const limiter = new TokenBucketLimiter(5, 1, () => 0)
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
