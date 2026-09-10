import { describe, expect, it, vi } from 'vitest'
import { createChatHandler } from './handler'
import { REFUSAL, RESTING_MESSAGE } from './prompt'
import { DailyBudget, SlidingWindowLimiter } from './rateLimit'

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

describe('POST /api/chat', () => {
  it('returns the model reply and sends the grounding prompt upstream', async () => {
    const fetchImpl = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
      const sent = JSON.parse(String(init?.body))
      expect(sent.systemInstruction.parts[0].text).toContain('14,053')
      expect(sent.systemInstruction.parts[0].text).toContain(REFUSAL)
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
    expect(String(url)).toContain('gemini-2.5-flash-lite:generateContent')
    expect(new Headers(init?.headers).get('x-goog-api-key')).toBe('test-key')
  })

  it('honours GEMINI_MODEL', async () => {
    const fetchImpl = vi.fn(async (_url: RequestInfo | URL) => geminiReply('ok'))
    const handler = createChatHandler({ env: { GEMINI_API_KEY: 'k', GEMINI_MODEL: 'gemini-x' }, fetchImpl, log: silent })
    await handler(post({ message: 'hi' }))
    expect(String(fetchImpl.mock.calls[0][0])).toContain('/models/gemini-x:generateContent')
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
      const handler = createChatHandler({ env: { GEMINI_API_KEY: 'k' }, fetchImpl, log: silent })
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
    const handler = createChatHandler({ env: { GEMINI_API_KEY: 'k' }, fetchImpl, log: silent })
    const res = await handler(post({ message: 'hi' }))
    const text = await res.text()
    expect(JSON.parse(text)).toEqual({ reply: RESTING_MESSAGE })
    expect(text).not.toContain('ENOTFOUND')
  })

  it('falls back to the refusal when the model returns nothing usable', async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ promptFeedback: { blockReason: 'SAFETY' } })))
    const handler = createChatHandler({ env: { GEMINI_API_KEY: 'k' }, fetchImpl, log: silent })
    const res = await handler(post({ message: 'hi' }))
    expect(await res.json()).toEqual({ reply: REFUSAL })
  })

  it('rate limits per IP with a 429 and retry-after', async () => {
    const fetchImpl = vi.fn(async () => geminiReply('ok'))
    const handler = createChatHandler({
      env: { GEMINI_API_KEY: 'k' },
      fetchImpl,
      limiter: new SlidingWindowLimiter(2, 60_000, () => 0),
      log: silent,
    })
    const ip = { 'x-forwarded-for': '203.0.113.5' }
    expect((await handler(post({ message: 'a' }, ip))).status).toBe(200)
    expect((await handler(post({ message: 'b' }, ip))).status).toBe(200)
    const blocked = await handler(post({ message: 'c' }, ip))
    expect(blocked.status).toBe(429)
    expect(blocked.headers.get('retry-after')).toBeTruthy()
    expect((await handler(post({ message: 'd' }, { 'x-forwarded-for': '203.0.113.6' }))).status).toBe(200)
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
