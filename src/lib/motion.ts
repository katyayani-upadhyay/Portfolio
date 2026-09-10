import type { Transition, Variants } from 'framer-motion'

/** The only entrance motion on the site: rise 8px and fade in, once. */
export const rise: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
}

export const ease: Transition = {
  duration: 0.4,
  ease: [0.2, 0.6, 0.2, 1],
}

export const viewportOnce = { once: true, margin: '0px 0px -10% 0px' } as const
