import raw from '../data/facts.json'
import { assertFacts, type Facts } from './facts'

assertFacts(raw)

/** The verified facts, loaded once for the whole client bundle. */
export const facts: Facts = raw
