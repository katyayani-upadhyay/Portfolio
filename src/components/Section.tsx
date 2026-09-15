import type { ReactNode } from 'react'

interface SectionProps {
  id: string
  index: string
  title: string
  note?: string
  children: ReactNode
}

/** Numbered, hairline-ruled section shell shared by every block below the hero. */
export default function Section({ id, index, title, note, children }: SectionProps) {
  return (
    <section id={id} className="border-t border-line" aria-labelledby={`${id}-title`}>
      <div className="mx-auto max-w-page px-5 py-16 sm:px-8 md:py-24">
        <header className="mb-10 flex flex-col gap-3 border-b border-line pb-5 sm:flex-row sm:items-end sm:justify-between md:mb-12">
          <div className="flex items-baseline gap-4">
            <span className="label !text-accent" aria-hidden="true">
              {index}
            </span>
            <h2 id={`${id}-title`} className="font-display text-3xl font-medium tracking-tight md:text-4xl">
              {title}
            </h2>
          </div>
          {note ? <p className="label sm:text-right">{note}</p> : null}
        </header>
        {children}
      </div>
    </section>
  )
}
