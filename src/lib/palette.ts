export const OPEN_PALETTE_EVENT = 'palette:open'

export function openPalette() {
  window.dispatchEvent(new CustomEvent(OPEN_PALETTE_EVENT))
}

export function isMac(): boolean {
  if (typeof navigator === 'undefined') return false
  return /Mac|iPhone|iPad/.test(navigator.platform) || /Mac/.test(navigator.userAgent)
}

/** Scrolls to a section, updates the hash, and moves focus to it. */
export function goToSection(hash: string) {
  const el = document.querySelector<HTMLElement>(hash)
  if (!el) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  history.replaceState(null, '', hash)
  if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1')
  el.focus({ preventScroll: true })
}
