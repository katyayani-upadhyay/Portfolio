/* eslint-disable react-refresh/only-export-components -- context provider and its hook live together */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

export type Theme = 'dark' | 'light'

interface ThemeContextValue {
  theme: Theme
  toggle: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function readInitialTheme(): Theme {
  if (typeof document === 'undefined') return 'light'
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Theme is a `dark` class on <html>. index.html applies the stored choice or
 * the system preference before first paint; this provider keeps React in
 * sync, persists explicit choices, and crossfades colours on toggle.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(readInitialTheme)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const toggle = useCallback(() => {
    const root = document.documentElement
    if (!prefersReducedMotion()) {
      root.classList.add('theme-transition')
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => root.classList.remove('theme-transition'), 350)
    }
    setTheme((current) => {
      const next: Theme = current === 'dark' ? 'light' : 'dark'
      try {
        localStorage.setItem('theme', next)
      } catch {
        // Storage may be unavailable (private mode); the toggle still works for this visit.
      }
      return next
    })
  }, [])

  const value = useMemo(() => ({ theme, toggle }), [theme, toggle])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): [Theme, () => void] {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return [ctx.theme, ctx.toggle]
}
