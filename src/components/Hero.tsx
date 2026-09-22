import { m, useReducedMotion } from 'framer-motion'
import { FaGithub, FaLinkedinIn } from 'react-icons/fa'
import { SiKaggle, SiLeetcode } from 'react-icons/si'
import { facts } from '../lib/loadFacts'
import { ease, rise } from '../lib/motion'
import AgentLoop from './AgentLoop'
import { ArrowDown, Download, Mail } from './Icons'

const { person, education, experience, projects } = facts
const latest = experience[0]
const copilot = projects[0]

const socials = [
  { label: 'GitHub', href: person.links.github, Icon: FaGithub },
  { label: 'LinkedIn', href: person.links.linkedin, Icon: FaLinkedinIn },
  { label: 'LeetCode', href: person.links.leetcode, Icon: SiLeetcode },
  { label: 'Kaggle', href: person.links.kaggle, Icon: SiKaggle },
]

/**
 * Instrument panel: five terse rows, every value derived from facts.json.
 * `active` marks the row that matters most to a recruiter right now.
 */
const panel = [
  { key: 'Status', value: 'Open to AI/ML & DS roles — 2026', active: true },
  { key: 'Latest', value: `${latest.role} @ ${latest.company}` },
  { key: 'Degree', value: `B.Tech CS · CGPA ${education.cgpa}` },
  { key: 'Projects', value: `${projects.length} flagship, live` },
  { key: 'Eval', value: `${copilot.metrics[4].value}-row eval — gate PASS` },
]

export default function Hero() {
  const reduce = useReducedMotion()
  const stagger = (i: number) =>
    reduce ? {} : { variants: rise, initial: 'hidden', animate: 'show', transition: { ...ease, delay: 0.05 * i } }

  return (
    <header className="mx-auto flex max-w-page items-center px-5 pb-10 pt-8 sm:px-8 md:min-h-[min(calc(100svh-12rem),46rem)] md:pb-14 md:pt-10">
      <div className="grid w-full gap-10 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          <m.p {...stagger(0)} className="label mb-5 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-accent">AI/ML &amp; Data Science Engineer</span>
            <span aria-hidden="true">/</span>
            <span>Full-time, 2026</span>
          </m.p>

          <m.h1
            {...stagger(1)}
            className="font-display text-[2.625rem] font-medium leading-[1.02] tracking-[-0.025em] sm:text-6xl lg:text-[3.75rem] xl:text-[4.25rem]"
          >
            {person.name}
          </m.h1>

          <m.p {...stagger(2)} className="mt-5 max-w-2xl font-display text-[1.375rem] leading-snug tracking-tight sm:text-[1.875rem]">
            {person.tagline}
          </m.p>

          <m.p {...stagger(3)} className="mt-4 max-w-xl text-[0.9375rem] leading-relaxed text-muted sm:text-[1.0625rem]">
            {person.positioning}
          </m.p>

          <m.div {...stagger(4)} className="mt-8 flex flex-wrap items-center gap-3">
            <a href={person.resumePath} download="Katyayani_Upadhyay_Resume.pdf" className="btn btn-primary">
              <Download />
              Download resume
            </a>
            <a href="#projects" className="btn btn-ghost">
              <ArrowDown />
              View projects
            </a>
          </m.div>

          <m.ul {...stagger(5)} className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2" aria-label="Profiles">
            {socials.map(({ label, href, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-slide inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg"
                >
                  <Icon size={13} aria-hidden="true" />
                  {label}
                </a>
              </li>
            ))}
            <li>
              <a href={`mailto:${person.email}`} className="link-slide inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg">
                <Mail size={13} />
                {person.email}
              </a>
            </li>
          </m.ul>
        </div>

        <div className="flex flex-col gap-6 lg:col-span-5 lg:pl-4">
          <m.div {...stagger(3)} className="panel" aria-labelledby="panel-title">
            <div className="flex items-center justify-between border-b border-line px-4 py-2">
              <p id="panel-title" className="label whitespace-nowrap !text-fg">
                Spec sheet
              </p>
              <span className="flex items-center gap-1.5" aria-hidden="true">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                <span className="label">2026</span>
              </span>
            </div>
            <dl>
              {panel.map((row) => (
                <div
                  key={row.key}
                  className="relative grid grid-cols-[4.5rem_1fr] items-baseline gap-3 border-b border-line px-4 py-2.5 last:border-b-0 sm:grid-cols-[5.5rem_1fr]"
                >
                  {row.active ? (
                    <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 bg-accent" aria-hidden="true" />
                  ) : null}
                  <dt className="label leading-5">{row.key}</dt>
                  <dd
                    className="whitespace-nowrap text-right font-mono text-[0.75rem] leading-5 text-fg sm:text-[0.8125rem]"
                  >
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </m.div>

          <m.div {...stagger(5)} className="hidden sm:block">
            <AgentLoop className="text-fg" />
          </m.div>
        </div>
      </div>
    </header>
  )
}
