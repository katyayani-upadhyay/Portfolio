import { useEffect, useState } from 'react'
import { facts } from '../lib/loadFacts'
import { useTheme } from '../lib/theme'
import { Close, Menu, Moon, Sun } from './Icons'

const links = [
  { href: '#projects', label: 'Projects' },
  { href: '#experience', label: 'Experience' },
  { href: '#skills', label: 'Skills' },
  { href: '#certifications', label: 'Certifications' },
  { href: '#contact', label: 'Contact' },
]

export default function Nav() {
  const [theme, toggleTheme] = useTheme()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const themeLabel = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'

  return (
    <nav className="sticky top-0 z-50 border-b border-line bg-bg" aria-label="Primary">
      <div className="mx-auto flex h-14 max-w-page items-center justify-between px-5 sm:px-8">
        <a href="#top" className="label !text-fg hover:text-accent">
          {facts.person.name}
        </a>

        <div className="hidden items-center gap-7 md:flex">
          <ul className="flex items-center gap-6">
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="font-mono text-[0.8125rem] text-muted transition-colors hover:text-fg">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <span className="h-4 w-px bg-line" aria-hidden="true" />
          <a
            href={facts.person.resumePath}
            download="Katyayani_Upadhyay_Resume.pdf"
            className="font-mono text-[0.8125rem] text-muted transition-colors hover:text-fg"
          >
            Resume
          </a>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={themeLabel}
            title={themeLabel}
            className="flex h-8 w-8 items-center justify-center rounded-sm border border-line text-fg transition-colors hover:border-fg"
          >
            {theme === 'dark' ? <Sun /> : <Moon />}
          </button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={themeLabel}
            className="flex h-8 w-8 items-center justify-center rounded-sm border border-line text-fg"
          >
            {theme === 'dark' ? <Sun /> : <Moon />}
          </button>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="flex h-8 w-8 items-center justify-center rounded-sm border border-line text-fg"
          >
            {open ? <Close /> : <Menu />}
          </button>
        </div>
      </div>

      {open ? (
        <div id="mobile-menu" className="border-t border-line bg-bg md:hidden">
          <ul className="mx-auto max-w-page px-5 py-2 sm:px-8">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block py-3 font-mono text-sm text-fg"
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href={facts.person.resumePath}
                download="Katyayani_Upadhyay_Resume.pdf"
                onClick={() => setOpen(false)}
                className="block py-3 font-mono text-sm text-fg"
              >
                Resume
              </a>
            </li>
          </ul>
        </div>
      ) : null}
    </nav>
  )
}
