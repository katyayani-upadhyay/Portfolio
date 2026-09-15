import { m, useScroll } from 'framer-motion'

/** One-pixel accent hairline at the very top that tracks scroll position. */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  return (
    <m.div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[60] h-px origin-left bg-accent"
      style={{ scaleX: scrollYProgress }}
    />
  )
}
