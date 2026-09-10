import { useCallback, useEffect, useState } from 'react'

export type Theme = 'dark' | 'light'

function readInitialTheme(): Theme {
  if (typeof document === 'undefined') return 'dark'
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

/**
 * Theme is a `dark` class on <html>. index.html applies it before first paint;
 * this hook keeps React in sync and persists explicit choices.
 */
export function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>(readInitialTheme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const toggle = useCallback(() => {
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

  return [theme, toggle]
}
