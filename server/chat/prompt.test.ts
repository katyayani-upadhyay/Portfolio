import { describe, expect, it } from 'vitest'
import { factsText } from './facts'
import { buildSystemPrompt, NOT_SHARED, RESTING_MESSAGE } from './prompt'

describe('buildSystemPrompt', () => {
  const prompt = buildSystemPrompt(factsText)

  it('defines all three lanes and the no-fabrication hard rule', () => {
    expect(prompt).toMatch(/LANE A - about Katyayani/)
    expect(prompt).toMatch(/LANE B - a general or technical question/)
    expect(prompt).toMatch(/LANE C - a personal question/)
    expect(prompt).toMatch(/HARD RULE - never fabricate or embellish/)
    expect(prompt).toContain('third person')
  })

  it('tells the model exactly what to say for lane C and points to contact links', () => {
    expect(prompt).toContain(NOT_SHARED)
    expect(NOT_SHARED).toContain('katyayani1612@gmail.com')
    expect(NOT_SHARED).toContain('LinkedIn')
  })

  it('embeds the facts verbatim between markers', () => {
    const start = prompt.indexOf('=== FACTS START ===')
    const end = prompt.indexOf('=== FACTS END ===')
    expect(start).toBeGreaterThan(0)
    expect(end).toBeGreaterThan(start)
    expect(prompt.slice(start, end)).toContain(factsText)
  })

  it('carries the current Copilot numbers and none of the superseded ones', () => {
    for (const current of ['2/10 → 10/10', '56% → 100%', '0.95', '60-row stratified eval', '0 hallucinated answers']) {
      expect(prompt).toContain(current)
    }
    for (const stale of ['0%→100%', '0% → 100%', '50%→100%', '0.99', '30-row']) {
      expect(prompt).not.toContain(stale)
    }
  })

  it('keeps the resting message unchanged', () => {
    expect(RESTING_MESSAGE).toBe('The assistant is resting — meanwhile, everything about Katyayani is on this page.')
  })
})
