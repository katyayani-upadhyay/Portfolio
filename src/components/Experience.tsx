import { facts } from '../lib/loadFacts'
import ReadoutStrip from './ReadoutStrip'
import Reveal from './Reveal'
import Section from './Section'

export default function Experience() {
  return (
    <Section id="experience" index="02" title="Experience" note="Reverse chronological">
      <ol className="divide-y divide-line">
        {facts.experience.map((e) => (
          <Reveal as="li" key={`${e.company}-${e.period}`} className="grid gap-6 py-8 md:grid-cols-12 md:gap-8">
            <div className="md:col-span-3">
              <p className="font-mono text-[0.8125rem] text-fg">{e.period}</p>
              <p className="label mt-1">{e.location}</p>
            </div>
            <div className="md:col-span-9">
              <h3 className="font-display text-xl font-medium tracking-tight md:text-2xl">
                {e.role}
                <span className="text-muted"> · {e.company}</span>
              </h3>
              <ul className="mt-5 space-y-3">
                {e.bullets.map((b) => (
                  <li key={b} className="flex gap-3 text-[0.9375rem] leading-relaxed text-muted">
                    <span className="mt-[0.7rem] h-px w-4 shrink-0 bg-accent" aria-hidden="true" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-7">
                <ReadoutStrip items={e.readouts} size="sm" label={`${e.company} results`} />
              </div>
            </div>
          </Reveal>
        ))}
      </ol>
    </Section>
  )
}
