export interface LimitResult {
  allowed: boolean
  retryAfterSeconds: number
}

/**
 * Sliding-window limiter keyed by caller (IP). In-memory, so it is per
 * serverless instance; that is enough to blunt casual abuse and cost spikes.
 */
export class SlidingWindowLimiter {
  private hits = new Map<string, number[]>()

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
    private readonly now: () => number = Date.now,
  ) {}

  check(key: string): LimitResult {
    const t = this.now()
    const floor = t - this.windowMs
    const recent = (this.hits.get(key) ?? []).filter((ts) => ts > floor)
    if (recent.length >= this.limit) {
      const retryAfterSeconds = Math.max(1, Math.ceil((recent[0] + this.windowMs - t) / 1000))
      this.hits.set(key, recent)
      return { allowed: false, retryAfterSeconds }
    }
    recent.push(t)
    this.hits.set(key, recent)
    if (this.hits.size > 5000) this.prune(floor)
    return { allowed: true, retryAfterSeconds: 0 }
  }

  private prune(floor: number) {
    for (const [key, stamps] of this.hits) {
      const live = stamps.filter((ts) => ts > floor)
      if (live.length === 0) this.hits.delete(key)
      else this.hits.set(key, live)
    }
  }
}

/** Soft per-instance daily cap so a runaway client cannot burn the free quota. */
export class DailyBudget {
  private day = ''
  private used = 0

  constructor(
    private readonly max: number,
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
