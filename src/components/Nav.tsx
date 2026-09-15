import { useEffect, useState } from 'react'
import { facts } from '../lib/loadFacts'
import { isMac, openPalette } from '../lib/palette'
import { useTheme } from '../lib/theme'
import { Close, Menu, Moon, Search, Sun } from './Icons'

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
  const shortcut = isMac() ? '⌘K' : 'Ctrl K'
  const iconButton =
    'flex h-8 w-8 items-center justify-center rounded-[3px] border border-line bg-raised text-fg transition-colors hover:border-fg'

  return (
    <nav className="sticky top-0 z-50 border-b border-line bg-bg/95 backdrop-blur-[2px]" aria-label="Primary">
      <div className="mx-auto flex h-14 max-w-page items-center justify-between px-5 sm:px-8">
        <a href="#top" className="link-slide font-display text-sm font-medium tracking-tight text-fg">
          {facts.person.name}
        </a>

        <div className="hidden items-center gap-6 md:flex">
          <ul className="flex items-center gap-5">
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="link-slide text-sm text-muted hover:text-fg">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <span className="h-4 w-px bg-line" aria-hidden="true" />
          <a
            href={facts.person.resumePath}
            download="Katyayani_Upadhyay_Resume.pdf"
            className="link-slide text-sm text-muted hover:text-fg"
          >
            Resume
          </a>
          <button
            type="button"
            onClick={openPalette}
            className="flex h-8 items-center gap-2 rounded-[3px] border border-line bg-raised px-2.5 text-xs text-muted transition-colors hover:border-fg hover:text-fg"
            aria-label={`Command palette, ${shortcut}`}
          >
            <Search size={14} />
            <kbd className="text-[0.7rem]">{shortcut}</kbd>
          </button>
          <button type="button" onClick={toggleTheme} aria-label={themeLabel} title={themeLabel} className={iconButton}>
            {theme === 'dark' ? <Sun /> : <Moon />}
          </button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button type="button" onClick={openPalette} aria-label="Open command palette" className={iconButton}>
            <Search size={14} />
          </button>
          <button type="button" onClick={toggleTheme} aria-label={themeLabel} className={iconButton}>
            {theme === 'dark' ? <Sun /> : <Moon />}
          </button>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className={iconButton}
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
                <a href={l.href} onClick={() => setOpen(false)} className="block py-3 text-base text-fg">
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href={facts.person.resumePath}
                download="Katyayani_Upadhyay_Resume.pdf"
                onClick={() => setOpen(false)}
                className="block py-3 text-base text-fg"
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
