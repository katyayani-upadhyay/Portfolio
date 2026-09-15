import { m, useReducedMotion } from 'framer-motion'
import { FaGithub, FaLinkedinIn } from 'react-icons/fa'
import { SiKaggle, SiLeetcode } from 'react-icons/si'
import { facts } from '../lib/loadFacts'
import { ease, rise } from '../lib/motion'
import { ArrowDown, Download, Mail } from './Icons'

const { person, education, experience, projects, certifications } = facts
const current = experience[0]

const socials = [
  { label: 'GitHub', href: person.links.github, Icon: FaGithub },
  { label: 'LinkedIn', href: person.links.linkedin, Icon: FaLinkedinIn },
  { label: 'LeetCode', href: person.links.leetcode, Icon: SiLeetcode },
  { label: 'Kaggle', href: person.links.kaggle, Icon: SiKaggle },
]

/** Spec-sheet rows. Every value is copied from facts.json. */
const spec = [
  { key: 'Role', value: 'AI/ML & Data Science Engineer' },
  { key: 'Status', value: `Seeking ${person.seeking}` },
  { key: 'Now', value: `${current.role}, ${current.company} (${current.period})` },
  { key: 'Education', value: `${education.degree}, ${education.institution}, ${education.graduation}` },
  { key: 'CGPA', value: education.cgpa },
  { key: 'Projects', value: `${projects.length} flagship, all with live demos` },
  { key: 'Certs', value: `${certifications.length} NPTEL` },
]

export default function Hero() {
  const reduce = useReducedMotion()
  const stagger = (i: number) =>
    reduce ? {} : { variants: rise, initial: 'hidden', animate: 'show', transition: { ...ease, delay: 0.05 * i } }

  return (
    <header className="mx-auto max-w-page px-5 pb-16 pt-14 sm:px-8 md:pb-24 md:pt-24">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          <m.p {...stagger(0)} className="label mb-6 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-accent">AI/ML &amp; Data Science Engineer</span>
            <span aria-hidden="true">/</span>
            <span>Full-time, 2026</span>
          </m.p>

          <m.h1
            {...stagger(1)}
            className="font-display text-[2.75rem] font-medium leading-[1.02] tracking-tight sm:text-6xl md:text-7xl"
          >
            {person.name}
          </m.h1>

          <m.p {...stagger(2)} className="mt-6 max-w-2xl font-display text-2xl leading-snug tracking-tight sm:text-3xl">
            {person.tagline}
          </m.p>

          <m.p {...stagger(3)} className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            {person.positioning}
          </m.p>

          <m.div {...stagger(4)} className="mt-10 flex flex-wrap items-center gap-3">
            <a href={person.resumePath} download="Katyayani_Upadhyay_Resume.pdf" className="btn btn-primary">
              <Download />
              Download resume
            </a>
            <a href="#projects" className="btn btn-ghost">
              <ArrowDown />
              View projects
            </a>
          </m.div>

          <m.ul {...stagger(5)} className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3" aria-label="Profiles">
            {socials.map(({ label, href, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-slide inline-flex items-center gap-2 font-mono text-[0.8125rem] text-muted hover:text-fg"
                >
                  <Icon size={14} aria-hidden="true" />
                  {label}
                </a>
              </li>
            ))}
            <li>
              <a
                href={`mailto:${person.email}`}
                className="link-slide inline-flex items-center gap-2 font-mono text-[0.8125rem] text-muted hover:text-fg"
              >
                <Mail size={14} />
                {person.email}
              </a>
            </li>
          </m.ul>
        </div>

        <m.div {...stagger(3)} className="panel self-start lg:col-span-5 lg:mt-2" aria-labelledby="spec-title">
          <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
            <p id="spec-title" className="label !text-fg">
              Spec sheet
            </p>
            <p className="label">{spec.length} fields</p>
          </div>
          <dl>
            {spec.map((row) => (
              <div
                key={row.key}
                className="grid grid-cols-[5.5rem_1fr] gap-3 border-b border-line px-4 py-2.5 last:border-b-0 sm:grid-cols-[6.5rem_1fr]"
              >
                <dt className="label leading-5">{row.key}</dt>
                <dd className="font-mono text-[0.8125rem] leading-5 text-fg">{row.value}</dd>
              </div>
            ))}
          </dl>
        </m.div>
      </div>
    </header>
  )
}
