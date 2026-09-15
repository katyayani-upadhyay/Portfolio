import { FaGithub, FaLinkedinIn } from 'react-icons/fa'
import { SiKaggle, SiLeetcode } from 'react-icons/si'
import { facts } from '../lib/loadFacts'
import { Mail } from './Icons'
import Reveal from './Reveal'
import Section from './Section'

const { person } = facts

const socials = [
  { label: 'GitHub', href: person.links.github, Icon: FaGithub },
  { label: 'LinkedIn', href: person.links.linkedin, Icon: FaLinkedinIn },
  { label: 'LeetCode', href: person.links.leetcode, Icon: SiLeetcode },
  { label: 'Kaggle', href: person.links.kaggle, Icon: SiKaggle },
]

export default function Contact() {
  return (
    <>
      <Section id="contact" index="05" title="Contact" note={`Seeking ${person.seeking}`}>
        <Reveal className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-7">
            <p className="max-w-xl font-display text-2xl leading-snug tracking-tight sm:text-3xl">
              Seeking AI/ML &amp; Data Science Engineer roles, 2026. If you are building systems that need to act
              reliably on real data, get in touch.
            </p>
            <a
              href={`mailto:${person.email}`}
              className="btn btn-primary mt-8 text-base"
            >
              <Mail />
              {person.email}
            </a>
          </div>
          <ul className="grid-cells grid-cols-2 self-start md:col-span-5" aria-label="Profiles">
            {socials.map(({ label, href, Icon }) => (
              <li key={label} className="grid-cell">
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-4 font-mono text-sm text-fg transition-colors hover:text-accent"
                >
                  <Icon size={14} aria-hidden="true" />
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      </Section>
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-page flex-col gap-2 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p className="label">© 2026 {person.name}</p>
          <p className="label">React · Vite · Tailwind · Vercel</p>
        </div>
      </footer>
    </>
  )
}
