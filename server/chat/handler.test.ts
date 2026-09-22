import { describe, expect, it, vi } from 'vitest'
import { createChatHandler, DEFAULT_MODEL, FALLBACK_MODEL } from './handler'
import { PAUSE_MESSAGE } from './prompt'
import { NOT_SHARED, RESTING_MESSAGE } from './prompt'
import { DailyBudget, TokenBucketLimiter } from './rateLimit'

function post(body: unknown, headers: Record<string, string> = {}) {
  return new Request('http://t/api/chat', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}

function geminiReply(text: string) {
  return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text }] } }] }), { status: 200 })
}

const silent = () => {}
const noSleep = async () => {}

describe('POST /api/chat', () => {
  it('returns the model reply and sends the grounding prompt upstream', async () => {
    const fetchImpl = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
      const sent = JSON.parse(String(init?.body))
      expect(sent.systemInstruction.parts[0].text).toContain('14,053')
      expect(sent.systemInstruction.parts[0].text).toContain('125,807')
      expect(sent.systemInstruction.parts[0].text).toContain(NOT_SHARED)
      expect(sent.contents[0].parts[0].text).toBe('What does the Copilot do?')
      expect(sent.generationConfig.maxOutputTokens).toBeLessThanOrEqual(256)
      expect(sent.generationConfig.temperature).toBeLessThanOrEqual(0.3)
      return geminiReply('She built an agentic RAG assistant.')
    })
    const handler = createChatHandler({ env: { GEMINI_API_KEY: 'test-key' }, fetchImpl, log: silent })
    const res = await handler(post({ message: 'What does the Copilot do?' }))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ reply: 'She built an agentic RAG assistant.' })
    const [url, init] = fetchImpl.mock.calls[0]
    expect(String(url)).toContain(`${DEFAULT_MODEL}:generateContent`)
    expect(DEFAULT_MODEL).toBe('gemini-3.5-flash-lite')
    expect(new Headers(init?.headers).get('x-goog-api-key')).toBe('test-key')
  })

  it('honours GEMINI_MODEL', async () => {
    const fetchImpl = vi.fn(async (_url: RequestInfo | URL) => geminiReply('ok'))
    const handler = createChatHandler({ env: { GEMINI_API_KEY: 'k', GEMINI_MODEL: 'gemini-x' }, fetchImpl, log: silent })
    await handler(post({ message: 'hi' }))
    expect(String(fetchImpl.mock.calls[0][0])).toContain('/models/gemini-x:generateContent')
  })

  it('falls back to the rolling alias once when the pinned model returns 404', async () => {
    const notFound = JSON.stringify({ error: { code: 404, message: 'no longer available to new users', status: 'NOT_FOUND' } })
    const fetchImpl = vi.fn(async (url: RequestInfo | URL) =>
      String(url).includes(`${DEFAULT_MODEL}:`) ? new Response(notFound, { status: 404 }) : geminiReply('via alias'),
    )
    const logs: string[] = []
    const handler = createChatHandler({ env: { GEMINI_API_KEY: 'k' }, fetchImpl, log: (m) => logs.push(m) })
    const res = await handler(post({ message: 'hi' }))
    expect(await res.json()).toEqual({ reply: 'via alias' })
    expect(fetchImpl).toHaveBeenCalledTimes(2)
    expect(String(fetchImpl.mock.calls[1][0])).toContain(`${FALLBACK_MODEL}:generateContent`)
    expect(logs.some((l) => l.includes('retrying'))).toBe(true)
  })

  it('does not retry past the fallback on 404, and never leaks the body', async () => {
    const fetchImpl = vi.fn(async () => new Response('{"error":{"message":"gone for good"}}', { status: 404 }))
    const handler = createChatHandler({ env: { GEMINI_API_KEY: 'k' }, fetchImpl, log: silent })
    const res = await handler(post({ message: 'hi' }))
    const text = await res.text()
    expect(JSON.parse(text)).toEqual({ reply: RESTING_MESSAGE })
    expect(text).not.toContain('gone for good')
    expect(fetchImpl).toHaveBeenCalledTimes(2)
  })

  it('logs the upstream status and body detail server-side only', async () => {
    const logs: string[] = []
    const fetchImpl = vi.fn(async () => new Response('{"error":{"message":"Quota exceeded"}}', { status: 429 }))
    const handler = createChatHandler({ env: { GEMINI_API_KEY: 'k' }, fetchImpl, log: (m) => logs.push(m), sleep: noSleep })
    const res = await handler(post({ message: 'hi' }))
    expect(await res.text()).not.toContain('Quota')
    expect(logs.join('\n')).toMatch(/upstream 429: .*Quota exceeded/)
  })

  it('rejects invalid input with 400 and a friendly message', async () => {
    const fetchImpl = vi.fn()
    const handler = createChatHandler({ env: { GEMINI_API_KEY: 'k' }, fetchImpl, log: silent })
    for (const body of [{}, { message: '' }, { message: 'x'.repeat(501) }, '{broken']) {
      const res = await handler(post(body))
      expect(res.status).toBe(400)
      const data = await res.json()
      expect(typeof data.reply).toBe('string')
      expect(data.reply).not.toMatch(/error|stack|exception/i)
    }
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('returns the resting message when the key is missing', async () => {
    const fetchImpl = vi.fn()
    const handler = createChatHandler({ env: {}, fetchImpl, log: silent })
    const res = await handler(post({ message: 'hi' }))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ reply: RESTING_MESSAGE })
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('returns the resting message on quota exhaustion and upstream errors, never the raw error', async () => {
    for (const status of [429, 500, 503]) {
      const fetchImpl = vi.fn(async () => new Response('{"error":{"message":"Quota exceeded for metric"}}', { status }))
      const handler = createChatHandler({ env: { GEMINI_API_KEY: 'k' }, fetchImpl, log: silent, sleep: noSleep })
      const res = await handler(post({ message: 'hi' }))
      expect(res.status).toBe(200)
      const text = await res.text()
      expect(JSON.parse(text)).toEqual({ reply: RESTING_MESSAGE })
      expect(text).not.toContain('Quota')
    }
  })

  it('returns the resting message when fetch throws', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new TypeError('fetch failed: ENOTFOUND')
    })
    const handler = createChatHandler({ env: { GEMINI_API_KEY: 'k' }, fetchImpl, log: silent, sleep: noSleep })
    const res = await handler(post({ message: 'hi' }))
    const text = await res.text()
    expect(JSON.parse(text)).toEqual({ reply: RESTING_MESSAGE })
    expect(text).not.toContain('ENOTFOUND')
  })

  it('falls back to "not shared" when the model returns nothing usable', async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ promptFeedback: { blockReason: 'SAFETY' } })))
    const handler = createChatHandler({ env: { GEMINI_API_KEY: 'k' }, fetchImpl, log: silent })
    const res = await handler(post({ message: 'hi' }))
    expect(await res.json()).toEqual({ reply: NOT_SHARED })
  })

  describe('three lanes', () => {
    const lanes = [
      {
        lane: 'A: about her, in the facts',
        question: 'How accurate is her GridLoad forecast?',
        reply: 'Her LightGBM day-ahead forecaster reached a WAPE of 2.16% against 4.49% for the seasonal-naive baseline over 15,335 hours.',
      },
      {
        lane: 'B: general technical question',
        question: 'What is CUPED?',
        reply: 'CUPED is a variance-reduction technique for A/B tests that uses pre-experiment data as a covariate. Katyayani used it in her GridLoad experiments, cutting variance by 94.7%.',
      },
      {
        lane: 'C: personal detail not in the facts',
        question: 'What are her parents\' names?',
        reply: NOT_SHARED,
      },
    ]
    for (const { lane, question, reply } of lanes) {
      it(`passes lane ${lane} through untouched with the lane instructions in the prompt`, async () => {
        const fetchImpl = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
          const sent = JSON.parse(String(init?.body))
          const system: string = sent.systemInstruction.parts[0].text
          expect(system).toContain('LANE A')
          expect(system).toContain('LANE B')
          expect(system).toContain('LANE C')
          expect(system).toContain('HARD RULE')
          expect(sent.contents[0].parts[0].text).toBe(question)
          return geminiReply(reply)
        })
        const handler = createChatHandler({ env: { GEMINI_API_KEY: 'k' }, fetchImpl, log: silent })
        const res = await handler(post({ message: question }))
        expect(res.status).toBe(200)
        expect(await res.json()).toEqual({ reply })
      })
    }
  })

  it('lets one visitor tap every chip in a row (burst), then pauses with a distinct message', async () => {
    const fetchImpl = vi.fn(async () => geminiReply('ok'))
    let t = 0
    const handler = createChatHandler({
      env: { GEMINI_API_KEY: 'k' },
      fetchImpl,
      limiter: new TokenBucketLimiter(5, 6, () => t),
      log: silent,
    })
    const ip = { 'x-forwarded-for': '203.0.113.5' }
    for (let i = 0; i < 3; i++) {
      expect((await handler(post({ message: `chip ${i}` }, ip))).status).toBe(200)
      t += 10_000 // three chips in 30 seconds
    }
    // Now hammer without pausing: the bucket must run dry within the burst size.
    let blocked: Response | null = null
    let allowedInRun = 0
    for (let i = 0; i < 10 && !blocked; i++) {
      const res = await handler(post({ message: `rapid ${i}` }, ip))
      if (res.status === 429) blocked = res
      else allowedInRun += 1
    }
    expect(blocked).not.toBeNull()
    if (!blocked) throw new Error('unreachable')
    expect(allowedInRun).toBeGreaterThanOrEqual(3)
    expect(allowedInRun).toBeLessThanOrEqual(6)
    expect(blocked.status).toBe(429)
    expect(blocked.headers.get('retry-after')).toBeTruthy()
    const body = await blocked.json()
    expect(body.reply).toBe(PAUSE_MESSAGE)
    expect(body.limited).toBe(true)
    expect(body.reply).not.toBe(RESTING_MESSAGE)
    expect((await handler(post({ message: 'other visitor' }, { 'x-forwarded-for': '203.0.113.6' }))).status).toBe(200)
  })

  it('retries once on a transient upstream error and then succeeds', async () => {
    let calls = 0
    const fetchImpl = vi.fn(async () => {
      calls += 1
      return calls === 1 ? new Response('{"error":{"message":"overloaded"}}', { status: 503 }) : geminiReply('second try')
    })
    const logs: string[] = []
    const handler = createChatHandler({ env: { GEMINI_API_KEY: 'k' }, fetchImpl, log: (m) => logs.push(m), sleep: noSleep })
    const res = await handler(post({ message: 'hi' }))
    expect(await res.json()).toEqual({ reply: 'second try' })
    expect(fetchImpl).toHaveBeenCalledTimes(2)
    expect(logs.some((l) => l.includes('transient'))).toBe(true)
  })

  it('retries once on a per-minute quota 429 from Gemini, then rests if it persists', async () => {
    const fetchImpl = vi.fn(async () => new Response('{"error":{"message":"Quota exceeded"}}', { status: 429 }))
    const handler = createChatHandler({ env: { GEMINI_API_KEY: 'k' }, fetchImpl, log: silent, sleep: noSleep })
    const res = await handler(post({ message: 'hi' }))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ reply: RESTING_MESSAGE })
    expect(fetchImpl).toHaveBeenCalledTimes(2)
  })

  it('does not retry on a 400 from upstream', async () => {
    const fetchImpl = vi.fn(async () => new Response('{"error":{"message":"bad request"}}', { status: 400 }))
    const handler = createChatHandler({ env: { GEMINI_API_KEY: 'k' }, fetchImpl, log: silent, sleep: noSleep })
    await handler(post({ message: 'hi' }))
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it('stops calling upstream once the daily budget is spent', async () => {
    const fetchImpl = vi.fn(async () => geminiReply('ok'))
    const handler = createChatHandler({
      env: { GEMINI_API_KEY: 'k' },
      fetchImpl,
      budget: new DailyBudget(1, () => 0),
      log: silent,
    })
    await handler(post({ message: 'a' }))
    const res = await handler(post({ message: 'b' }))
    expect(await res.json()).toEqual({ reply: RESTING_MESSAGE })
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })
})
