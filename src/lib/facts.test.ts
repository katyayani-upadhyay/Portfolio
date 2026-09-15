import { describe, expect, it } from 'vitest'
import raw from '../data/facts.json'
import { assertFacts, factsToText, type Facts } from './facts'
import { facts } from './loadFacts'

describe('facts loader', () => {
  it('loads and passes the structural check', () => {
    expect(() => assertFacts(raw)).not.toThrow()
    expect(facts.person.name).toBe('Katyayani Upadhyay')
  })

  it('features exactly the three flagship projects with https links', () => {
    expect(facts.projects.map((p) => p.name)).toEqual([
      'QuickCommerce Copilot',
      'GridLoad Demand & Experiments',
      'Agentic AI Research Platform',
    ])
    for (const p of facts.projects) {
      expect(p.github).toMatch(/^https:\/\/github\.com\/katyayani-upadhyay\//)
      expect(p.live).toMatch(/^https:\/\//)
      expect(p.metrics.length).toBeGreaterThan(0)
    }
  })

  it('carries no superseded 30-row Copilot numbers', () => {
    const blob = JSON.stringify(facts)
    for (const stale of ['0%→100%', '0% → 100%', '50%→100%', '50% → 100%', '0.99', '30-row']) {
      expect(blob).not.toContain(stale)
    }
  })

  it('contains no internship-seeking language', () => {
    expect(facts.person.seeking.toLowerCase()).not.toContain('intern')
    expect(facts.person.positioning.toLowerCase()).not.toContain('intern')
  })

  it('keeps the six skill groups in the agreed order', () => {
    expect(facts.skills.map((g) => g.group)).toEqual([
      'GenAI & Agentic AI',
      'Data Science & Statistics',
      'Data Engineering',
      'AI/ML',
      'MLOps & Deployment',
      'Programming',
    ])
  })

  it('rejects malformed data', () => {
    expect(() => assertFacts(null)).toThrow()
    expect(() => assertFacts({})).toThrow()
    const twoProjects = { ...facts, projects: facts.projects.slice(0, 2) } as Facts
    expect(() => assertFacts(twoProjects)).toThrow(/three projects/)
    const httpLink = {
      ...facts,
      projects: facts.projects.map((p, i) => (i === 0 ? { ...p, live: 'http://example.com' } : p)),
    } as Facts
    expect(() => assertFacts(httpLink)).toThrow(/https/)
  })
})

describe('factsToText', () => {
  const text = factsToText(facts)

  it('carries the verified numbers through verbatim', () => {
    for (const needle of [
      '14,053',
      '1,064',
      '~240K records (~27%)',
      '161/161',
      '80%+',
      '50,000+',
      'sub-200ms',
      '2/10 → 10/10',
      '56% → 100%',
      '0.95',
      '60-row stratified eval',
      '0 hallucinated answers',
      '2.16%',
      '4.49%',
      '15,335',
      '56/56',
      'MDE 4.2%',
      '94.7%',
      '−2.2%',
      '20+',
      '70%',
      'CGPA 8.56',
    ]) {
      expect(text).toContain(needle)
    }
  })

  it('includes every link and the contact email', () => {
    expect(text).toContain('katyayani1612@gmail.com')
    expect(text).toContain('https://leetcode.com/u/Katyayani16')
    expect(text).toContain('https://www.kaggle.com/katyayaniupadhyay')
    for (const p of facts.projects) {
      expect(text).toContain(p.github)
      expect(text).toContain(p.live)
    }
  })

  it('includes every skill and certification', () => {
    for (const g of facts.skills) for (const s of g.items) expect(text).toContain(s)
    for (const c of facts.certifications) expect(text).toContain(c.name)
  })
})
