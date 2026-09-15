import { AnimatePresence, m, useReducedMotion } from 'framer-motion'
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { facts } from '../lib/loadFacts'
import { goToSection, isMac, OPEN_PALETTE_EVENT } from '../lib/palette'
import { useTheme } from '../lib/theme'
import { CornerDownLeft, Search } from './Icons'

interface Command {
  id: string
  group: 'Sections' | 'Actions' | 'Links'
  label: string
  hint?: string
  keywords?: string
  run: () => void
}

const { person } = facts

function focusable(root: HTMLElement): HTMLElement[] {
  return Array.from(
    root.querySelectorAll<HTMLElement>('input, button, [href], [tabindex]:not([tabindex="-1"])'),
  ).filter((el) => !el.hasAttribute('disabled'))
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const [, toggleTheme] = useTheme()
  const reduce = useReducedMotion()
  const dialogRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const restoreRef = useRef<HTMLElement | null>(null)
  const listId = useId()
  const titleId = useId()

  const close = useCallback(() => setOpen(false), [])

  const commands = useMemo<Command[]>(() => {
    const section = (id: string, label: string, keywords = ''): Command => ({
      id: `section-${id}`,
      group: 'Sections',
      label,
      hint: `#${id}`,
      keywords,
      run: () => goToSection(`#${id}`),
    })
    const external = (id: string, label: string, href: string): Command => ({
      id: `link-${id}`,
      group: 'Links',
      label,
      hint: href.replace(/^https?:\/\/(www\.)?/, ''),
      run: () => window.open(href, '_blank', 'noopener,noreferrer'),
    })
    return [
      section('top', 'Top', 'home hero'),
      section('projects', 'Flagship projects', 'copilot gridload research'),
      section('experience', 'Experience', 'gobblecube nielit timeline'),
      section('skills', 'Skills', 'stack tools'),
      section('certifications', 'Certifications', 'nptel'),
      section('contact', 'Contact', 'email hire roles'),
      { id: 'theme', group: 'Actions', label: 'Toggle theme', hint: 'light / dark', keywords: 'dark light mode', run: toggleTheme },
      {
        id: 'resume',
        group: 'Actions',
        label: 'Download resume',
        hint: 'PDF',
        keywords: 'cv',
        run: () => {
          const a = document.createElement('a')
          a.href = person.resumePath
          a.download = 'Katyayani_Upadhyay_Resume.pdf'
          a.click()
        },
      },
      external('github', 'GitHub', person.links.github),
      external('linkedin', 'LinkedIn', person.links.linkedin),
      external('leetcode', 'LeetCode', person.links.leetcode),
      external('kaggle', 'Kaggle', person.links.kaggle),
      { id: 'email', group: 'Links', label: 'Email', hint: person.email, keywords: 'contact mail', run: () => window.location.assign(`mailto:${person.email}`) },
    ]
  }, [toggleTheme])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return commands
    return commands.filter((c) => `${c.label} ${c.hint ?? ''} ${c.keywords ?? ''} ${c.group}`.toLowerCase().includes(q))
  }, [commands, query])

  useEffect(() => setActive(0), [results])

  // Global shortcut and the nav button both open the palette.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    const onOpen = () => setOpen(true)
    window.addEventListener('keydown', onKey)
    window.addEventListener(OPEN_PALETTE_EVENT, onOpen)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener(OPEN_PALETTE_EVENT, onOpen)
    }
  }, [])

  // Focus management, scroll lock, and Escape while open.
  useEffect(() => {
    if (!open) return
    restoreRef.current = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    setQuery('')
    const raf = requestAnimationFrame(() => inputRef.current?.focus())
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        close()
      }
      if (e.key === 'Tab' && dialogRef.current) {
        const nodes = focusable(dialogRef.current)
        if (nodes.length === 0) return
        const first = nodes[0]
        const last = nodes[nodes.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
      restoreRef.current?.focus?.()
    }
  }, [open, close])

  function run(cmd: Command) {
    close()
    // Let the dialog unmount and focus restore before navigating.
    window.setTimeout(() => cmd.run(), 0)
  }

  function onInputKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => (results.length ? (i + 1) % results.length : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => (results.length ? (i - 1 + results.length) % results.length : 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const cmd = results[active]
      if (cmd) run(cmd)
    } else if (e.key === 'Home') {
      setActive(0)
    } else if (e.key === 'End') {
      setActive(Math.max(0, results.length - 1))
    }
  }

  const motionProps = reduce
    ? {}
    : {
        initial: { opacity: 0, y: -6, scale: 0.99 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: -4, scale: 0.99 },
        transition: { duration: 0.16, ease: [0.2, 0.6, 0.2, 1] as const },
      }

  let lastGroup: string | null = null

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[70] flex items-start justify-center px-4 pt-[12vh]">
          <button
            type="button"
            aria-label="Close command palette"
            onClick={close}
            className="absolute inset-0 cursor-default bg-fg/20"
            tabIndex={-1}
          />
          <m.div
            key="palette"
            ref={dialogRef}
            {...motionProps}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="panel relative w-full max-w-xl overflow-hidden"
          >
            <h2 id={titleId} className="sr-only">
              Command palette
            </h2>
            <div className="flex items-center gap-3 border-b border-line px-4">
              <Search className="shrink-0 text-muted" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onInputKey}
                placeholder="Jump to a section, open a link, toggle theme…"
                aria-label="Search commands"
                role="combobox"
                aria-expanded="true"
                aria-controls={listId}
                aria-activedescendant={results[active] ? `${listId}-${results[active].id}` : undefined}
                autoComplete="off"
                spellCheck={false}
                className="min-w-0 flex-1 bg-transparent py-3.5 text-sm text-fg placeholder:text-muted focus:outline-none"
              />
              <kbd className="label rounded-[3px] border border-line px-1.5 py-0.5 !text-muted">esc</kbd>
            </div>

            <ul id={listId} role="listbox" aria-label="Commands" className="max-h-[50vh] overflow-y-auto py-2">
              {results.length === 0 ? (
                <li className="px-4 py-6 text-center text-sm text-muted">No matches.</li>
              ) : null}
              {results.map((cmd, i) => {
                const showGroup = cmd.group !== lastGroup
                lastGroup = cmd.group
                const selected = i === active
                return (
                  <li key={cmd.id} role="presentation">
                    {showGroup ? <p className="label px-4 pb-1 pt-3">{cmd.group}</p> : null}
                    <div
                      id={`${listId}-${cmd.id}`}
                      role="option"
                      aria-selected={selected}
                      onMouseEnter={() => setActive(i)}
                      onClick={() => run(cmd)}
                      className={`mx-2 flex cursor-pointer items-center justify-between gap-4 rounded-[3px] px-2 py-2 text-sm ${
                        selected ? 'bg-fg text-bg' : 'text-fg'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span
                          className={`h-1.5 w-1.5 shrink-0 rounded-full ${selected ? 'bg-accent' : 'bg-line'}`}
                          aria-hidden="true"
                        />
                        {cmd.label}
                      </span>
                      <span className="flex items-center gap-3">
                        {cmd.hint ? (
                          <span className={`truncate font-mono text-[0.75rem] ${selected ? 'text-bg/70' : 'text-muted'}`}>
                            {cmd.hint}
                          </span>
                        ) : null}
                        {selected ? <CornerDownLeft size={14} className="shrink-0" /> : null}
                      </span>
                    </div>
                  </li>
                )
              })}
            </ul>

            <div className="flex items-center justify-between border-t border-line px-4 py-2">
              <p className="label">
                <kbd>↑↓</kbd> navigate · <kbd>↵</kbd> select
              </p>
              <p className="label">{isMac() ? '⌘K' : 'Ctrl K'} to toggle</p>
            </div>
          </m.div>
        </div>
      ) : null}
    </AnimatePresence>
  )
}
