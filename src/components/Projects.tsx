import { FaGithub } from 'react-icons/fa'
import { facts } from '../lib/loadFacts'
import type { Project } from '../lib/facts'
import { ArrowUpRight } from './Icons'
import ReadoutStrip from './ReadoutStrip'
import Reveal from './Reveal'
import Section from './Section'

function ProjectRow({ project }: { project: Project }) {
  return (
    <Reveal as="article" className="panel panel-hover" aria-labelledby={`${project.id}-title`}>
      <div className="grid gap-8 p-6 md:p-8 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-4">
          <p className="label flex items-center gap-3">
            <span className="text-accent">{project.index}</span>
            <span>{project.kind}</span>
          </p>
          <h3 id={`${project.id}-title`} className="mt-3 font-display text-2xl font-medium tracking-tight md:text-3xl">
            {project.name}
          </h3>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a href={project.github} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
              <FaGithub size={14} aria-hidden="true" />
              GitHub
            </a>
            <a href={project.live} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              Live
              <ArrowUpRight />
            </a>
          </div>
          {project.liveNote ? <p className="label mt-3 normal-case tracking-normal">{project.liveNote}</p> : null}
        </div>

        <div className="flex flex-col gap-7 lg:col-span-8">
          <dl className="grid gap-6 md:grid-cols-2">
            <div>
              <dt className="label mb-2">Problem</dt>
              <dd className="text-[0.9375rem] leading-relaxed text-muted">{project.problem}</dd>
            </div>
            <div>
              <dt className="label mb-2">What I built</dt>
              <dd className="text-[0.9375rem] leading-relaxed text-fg">{project.built}</dd>
            </div>
          </dl>

          <ReadoutStrip items={project.metrics} label={`${project.name} results`} />

          <ul className="flex flex-wrap gap-2" aria-label="Technologies">
            {project.tech.map((t) => (
              <li key={t} className="chip">
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Reveal>
  )
}

export default function Projects() {
  return (
    <Section id="projects" index="01" title="Flagship projects" note="Three systems. Measured, not marketed.">
      <div className="space-y-6">
        {facts.projects.map((p) => (
          <ProjectRow key={p.id} project={p} />
        ))}
      </div>
    </Section>
  )
}
