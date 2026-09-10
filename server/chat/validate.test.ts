import { describe, expect, it } from 'vitest'
import { MAX_MESSAGE_CHARS, parseChatRequest, readJson } from './validate'

describe('parseChatRequest', () => {
  it('accepts a normal question and normalises whitespace', () => {
    const r = parseChatRequest({ message: '  What   does\nthe Copilot do? ' })
    expect(r).toEqual({ ok: true, message: 'What does the Copilot do?' })
  })

  it('rejects non-object bodies', () => {
    for (const body of [undefined, null, 'hi', 42, ['message']]) {
      const r = parseChatRequest(body)
      expect(r.ok).toBe(false)
    }
  })

  it('rejects a missing or non-string message', () => {
    expect(parseChatRequest({}).ok).toBe(false)
    expect(parseChatRequest({ message: 5 }).ok).toBe(false)
    expect(parseChatRequest({ message: { text: 'x' } }).ok).toBe(false)
  })

  it('rejects empty and whitespace-only messages', () => {
    expect(parseChatRequest({ message: '' }).ok).toBe(false)
    expect(parseChatRequest({ message: '   \n\t ' }).ok).toBe(false)
  })

  it('enforces the character cap after trimming', () => {
    const atCap = 'a'.repeat(MAX_MESSAGE_CHARS)
    expect(parseChatRequest({ message: atCap }).ok).toBe(true)
    const overCap = 'a'.repeat(MAX_MESSAGE_CHARS + 1)
    const r = parseChatRequest({ message: overCap })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error).toContain(String(MAX_MESSAGE_CHARS))
  })

  it('never echoes the input inside an error', () => {
    const r = parseChatRequest({ message: 'x'.repeat(600) })
    if (!r.ok) expect(r.error).not.toContain('xxxx')
  })
})

describe('readJson', () => {
  it('parses valid JSON bodies', async () => {
    const req = new Request('http://t/api/chat', { method: 'POST', body: JSON.stringify({ message: 'hi' }) })
    expect(await readJson(req)).toEqual({ message: 'hi' })
  })

  it('returns undefined for malformed or oversized JSON', async () => {
    const bad = new Request('http://t/api/chat', { method: 'POST', body: '{not json' })
    expect(await readJson(bad)).toBeUndefined()
    const huge = new Request('http://t/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message: 'a'.repeat(5000) }),
    })
    expect(await readJson(huge)).toBeUndefined()
  })
})
