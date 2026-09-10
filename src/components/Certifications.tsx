import { facts } from '../lib/loadFacts'
import Reveal from './Reveal'
import Section from './Section'

export default function Certifications() {
  return (
    <Section id="certifications" index="04" title="Certifications" note="NPTEL">
      <Reveal>
        <ul className="grid-cells sm:grid-cols-2 lg:grid-cols-4">
          {facts.certifications.map((c) => (
            <li key={c.name} className="grid-cell flex flex-col gap-3 p-5">
              <p className="label flex justify-between">
                <span>{c.provider}</span>
                <span className="text-fg">{c.year}</span>
              </p>
              <h3 className="font-display text-base font-medium leading-snug">{c.name}</h3>
              <p className="mt-auto font-mono text-[0.8125rem] text-muted">
                <span className="text-accent">{c.grade}</span> · {c.institute}
              </p>
            </li>
          ))}
        </ul>
      </Reveal>
    </Section>
  )
}
