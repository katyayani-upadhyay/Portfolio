import { facts } from '../lib/loadFacts'
import Reveal from './Reveal'
import Section from './Section'

export default function Skills() {
  return (
    <Section id="skills" index="03" title="Skills" note="Grouped by how the work gets done">
      <Reveal>
        <div className="grid-cells md:grid-cols-2 lg:grid-cols-3">
          {facts.skills.map((group, i) => (
            <div key={group.group} className="grid-cell p-6">
              <h3 className="label flex items-center gap-3 !text-fg">
                <span className="text-accent">{String(i + 1).padStart(2, '0')}</span>
                {group.group}
              </h3>
              <ul className="mt-4 flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <li key={item} className="chip">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Reveal>
    </Section>
  )
}
