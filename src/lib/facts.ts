/**
 * Shape of src/data/facts.json, the single source of truth for every claim
 * on the site and in the chatbot. Nothing here is fetched or generated; it is
 * the verified content, typed.
 */
export interface Readout {
  value: string
  label: string
}

export interface Person {
  name: string
  tagline: string
  positioning: string
  email: string
  links: {
    github: string
    linkedin: string
    leetcode: string
    kaggle: string
  }
  resumePath: string
  seeking: string
}

export interface Education {
  degree: string
  institution: string
  graduation: string
  cgpa: string
}

export interface Experience {
  company: string
  role: string
  location: string
  period: string
  summary: string
  bullets: string[]
  readouts: Readout[]
}

export interface Project {
  id: string
  index: string
  name: string
  kind: string
  problem: string
  built: string
  metrics: Readout[]
  tech: string[]
  github: string
  live: string
  liveNote: string | null
}

export interface SkillGroup {
  group: string
  items: string[]
}

export interface Certification {
  name: string
  grade: string
  institute: string
  year: string
  provider: string
}

export interface Facts {
  person: Person
  education: Education
  experience: Experience[]
  projects: Project[]
  skills: SkillGroup[]
  certifications: Certification[]
}

/** Structural check used by tests and by the server before building a prompt. */
export function assertFacts(value: unknown): asserts value is Facts {
  const f = value as Partial<Facts> | null
  if (!f || typeof f !== 'object') throw new Error('facts: not an object')
  if (!f.person?.name || !f.person.email) throw new Error('facts: person incomplete')
  if (!f.education?.degree) throw new Error('facts: education incomplete')
  if (!Array.isArray(f.experience) || f.experience.length === 0) throw new Error('facts: experience missing')
  if (!Array.isArray(f.projects) || f.projects.length !== 3) throw new Error('facts: exactly three projects expected')
  if (!Array.isArray(f.skills) || f.skills.length === 0) throw new Error('facts: skills missing')
  if (!Array.isArray(f.certifications) || f.certifications.length === 0) throw new Error('facts: certifications missing')
  for (const p of f.projects) {
    if (!p.github?.startsWith('https://') || !p.live?.startsWith('https://')) {
      throw new Error(`facts: project ${p.name ?? '?'} needs https github and live links`)
    }
  }
}

/**
 * Renders the facts as plain text for the chatbot's system prompt.
 * Every string is copied through unchanged so the model only ever sees
 * verified content.
 */
export function factsToText(f: Facts): string {
  const lines: string[] = []
  const { person, education } = f

  lines.push(`# ${person.name}`)
  lines.push(`Tagline: ${person.tagline}`)
  lines.push(`Positioning: ${person.positioning}`)
  lines.push(`Seeking: ${person.seeking}`)
  lines.push(`Email: ${person.email}`)
  lines.push(`GitHub: ${person.links.github}`)
  lines.push(`LinkedIn: ${person.links.linkedin}`)
  lines.push(`LeetCode: ${person.links.leetcode}`)
  lines.push(`Kaggle: ${person.links.kaggle}`)
  lines.push('')

  lines.push('## Education')
  lines.push(`${education.degree}, ${education.institution}, ${education.graduation}, CGPA ${education.cgpa}.`)
  lines.push('')

  lines.push('## Experience')
  for (const e of f.experience) {
    lines.push(`### ${e.role}, ${e.company}, ${e.location} (${e.period})`)
    for (const b of e.bullets) lines.push(`- ${b}`)
    lines.push('')
  }

  lines.push('## Projects (the only three projects to discuss)')
  for (const p of f.projects) {
    lines.push(`### ${p.name} (${p.kind})`)
    lines.push(`Problem: ${p.problem}`)
    lines.push(`Built: ${p.built}`)
    lines.push(`Metrics: ${p.metrics.map((m) => `${m.value} ${m.label}`).join('; ')}`)
    lines.push(`Tech: ${p.tech.join(', ')}`)
    lines.push(`GitHub: ${p.github}`)
    lines.push(`Live: ${p.live}`)
    if (p.liveNote) lines.push(`Note: ${p.liveNote}`)
    lines.push('')
  }

  lines.push('## Skills')
  for (const g of f.skills) lines.push(`- ${g.group}: ${g.items.join(', ')}`)
  lines.push('')

  lines.push('## Certifications')
  for (const c of f.certifications) {
    lines.push(`- ${c.name} (${c.provider}, ${c.grade}, ${c.institute}, ${c.year})`)
  }

  return lines.join('\n')
}
