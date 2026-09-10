import { m, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'
import { ease, rise, viewportOnce } from '../lib/motion'

interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
  as?: 'div' | 'li' | 'article'
}

/**
 * Fades and rises content 8px the first time it enters the viewport.
 * Renders statically when the visitor prefers reduced motion.
 */
export default function Reveal({ children, className, delay = 0, as = 'div' }: RevealProps) {
  const reduce = useReducedMotion()
  const Tag = m[as]
  if (reduce) {
    const Static = as
    return <Static className={className}>{children}</Static>
  }
  return (
    <Tag
      className={className}
      variants={rise}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      transition={{ ...ease, delay }}
    >
      {children}
    </Tag>
  )
}
