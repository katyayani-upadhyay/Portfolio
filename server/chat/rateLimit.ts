export interface LimitResult {
  allowed: boolean
  retryAfterSeconds: number
}

/**
 * Token-bucket limiter keyed by caller (IP). A visitor may spend up to
 * `burst` requests at once; tokens refill at `perMinute` per minute. A recruiter
 * tapping every suggestion chip in quick succession stays well inside the
 * bucket; a script hammering the endpoint drains it and waits.
 * In-memory, so per serverless instance; that is enough to blunt casual abuse.
 */
export class TokenBucketLimiter {
  private buckets = new Map<string, { tokens: number; updated: number }>()

  constructor(
    readonly perMinute: number,
    readonly burst: number,
    private readonly now: () => number = Date.now,
  ) {}

  private refillMs(): number {
    return 60_000 / this.perMinute
  }

  check(key: string): LimitResult {
    const t = this.now()
    const b = this.buckets.get(key) ?? { tokens: this.burst, updated: t }
    const refilled = Math.floor((t - b.updated) / this.refillMs())
    if (refilled > 0) {
      b.tokens = Math.min(this.burst, b.tokens + refilled)
      b.updated += refilled * this.refillMs()
    }
    if (b.tokens <= 0) {
      const retryAfterSeconds = Math.max(1, Math.ceil((b.updated + this.refillMs() - t) / 1000))
      this.buckets.set(key, b)
      return { allowed: false, retryAfterSeconds }
    }
    b.tokens -= 1
    this.buckets.set(key, b)
    if (this.buckets.size > 5000) this.prune(t)
    return { allowed: true, retryAfterSeconds: 0 }
  }

  private prune(t: number) {
    for (const [key, b] of this.buckets) {
      if (t - b.updated > 10 * this.refillMs() && b.tokens >= this.burst) this.buckets.delete(key)
    }
  }
}

/**
 * Soft per-instance daily cap so a runaway client cannot burn the free quota.
 * Sized for hundreds of demo sessions a day, not for one.
 */
export class DailyBudget {
  private day = ''
  private used = 0

  constructor(
    readonly max: number,
    private readonly now: () => number = Date.now,
  ) {}

  take(): boolean {
    const today = new Date(this.now()).toISOString().slice(0, 10)
    if (today !== this.day) {
      this.day = today
      this.used = 0
    }
    if (this.used >= this.max) return false
    this.used += 1
    return true
  }
}

export function clientKey(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return request.headers.get('x-real-ip') ?? 'anonymous'
}
