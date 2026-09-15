import { m, useReducedMotion } from 'framer-motion'

/**
 * Signature visual: the Copilot's decide → act → reflect loop, with the
 * citation guardrail sitting on the return path. Hairline strokes, one accent.
 * Paths draw in once on mount; static under reduced motion.
 */
export default function AgentLoop({ className = '' }: { className?: string }) {
  const reduce = useReducedMotion()
  const draw = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { pathLength: 0, opacity: 0 },
          animate: { pathLength: 1, opacity: 1 },
          transition: { pathLength: { duration: 0.7, delay, ease: [0.2, 0.6, 0.2, 1] as const }, opacity: { duration: 0.2, delay } },
        }
  const fade = (delay: number) =>
    reduce ? {} : { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3, delay } }

  const node = 'fill-raised stroke-line'
  const text = 'fill-fg font-display text-[11px] font-medium'
  const small = 'fill-muted font-mono text-[9px] uppercase'

  return (
    <figure className={className}>
      <svg viewBox="0 0 440 150" role="img" aria-labelledby="agent-loop-title agent-loop-desc" className="h-auto w-full">
        <title id="agent-loop-title">Agent loop schematic</title>
        <desc id="agent-loop-desc">
          Decide, act, and reflect nodes in a cycle; the return path passes through a citation guardrail that refuses rather
          than guesses.
        </desc>
        <defs>
          <marker id="al-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
            <path d="M0.5 0.5 L7.5 4 L0.5 7.5" fill="none" className="stroke-muted" strokeWidth="1" strokeLinejoin="round" />
          </marker>
        </defs>

        {/* nodes */}
        {[
          { x: 20, label: 'Decide', sub: 'plan the step' },
          { x: 172, label: 'Act', sub: 'typed MCP call' },
          { x: 324, label: 'Reflect', sub: 'check the result' },
        ].map((n, i) => (
          <m.g key={n.label} {...fade(0.15 + i * 0.25)}>
            <rect x={n.x} y={26} width={96} height={34} rx={3} className={node} strokeWidth={1} />
            <text x={n.x + 48} y={41} textAnchor="middle" className={text} style={{ letterSpacing: '-0.01em' }}>
              {n.label}
            </text>
            <text x={n.x + 48} y={53} textAnchor="middle" className={small} style={{ letterSpacing: '0.08em' }}>
              {n.sub}
            </text>
          </m.g>
        ))}

        {/* forward hairlines */}
        <m.path d="M116 43 H171" fill="none" className="stroke-muted" strokeWidth={1} markerEnd="url(#al-arrow)" {...draw(0.3)} />
        <m.path d="M268 43 H323" fill="none" className="stroke-muted" strokeWidth={1} markerEnd="url(#al-arrow)" {...draw(0.55)} />

        {/* return path through the guardrail */}
        <m.path
          d="M372 60 V110 H236"
          fill="none"
          className="stroke-muted"
          strokeWidth={1}
          {...draw(0.8)}
        />
        <m.path
          d="M204 110 H68 V61"
          fill="none"
          className="stroke-muted"
          strokeWidth={1}
          markerEnd="url(#al-arrow)"
          {...draw(1.1)}
        />

        {/* guardrail: the one accent */}
        <m.g {...fade(1.0)}>
          <path d="M220 96 L234 110 L220 124 L206 110 Z" className="fill-bg stroke-accent" strokeWidth={1.25} />
          <circle cx={220} cy={110} r={2.5} className="fill-accent" />
          <text x={220} y={140} textAnchor="middle" className={small} style={{ letterSpacing: '0.08em' }}>
            guardrail · cite or refuse
          </text>
        </m.g>

        {/* loop label */}
        <m.text
          x={20}
          y={12}
          className={small}
          style={{ letterSpacing: '0.08em' }}
          {...fade(0.1)}
        >
          Agent loop · QuickCommerce Copilot
        </m.text>
      </svg>
    </figure>
  )
}
