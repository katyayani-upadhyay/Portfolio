import raw from '../../src/data/facts.json'
import { assertFacts, factsToText, type Facts } from '../../src/lib/facts'

assertFacts(raw)

export const facts: Facts = raw

/** Rendered once per instance; the facts do not change at runtime. */
export const factsText: string = factsToText(facts)
