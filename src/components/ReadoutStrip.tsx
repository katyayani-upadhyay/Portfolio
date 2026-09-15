import type { Readout } from '../lib/facts'

interface ReadoutStripProps {
  items: Readout[]
  size?: 'md' | 'sm'
  label?: string
}

/**
 * Metrics rendered like an instrument panel: tabular mono numerals with a
 * caption underneath, cells divided by hairlines.
 */
export default function ReadoutStrip({ items, size = 'md', label = 'Measured results' }: ReadoutStripProps) {
  // Long values (e.g. 56% → 100%) step the numerals down one size so a strip keeps a single scale.
  const long = items.some((item) => item.value.length >= 7)
  // Five cells sit 3 over 2 on a six-column grid; odd counts on two columns let the last cell span.
  const cols =
    items.length <= 2
      ? 'grid-cols-2'
      : items.length === 3
        ? 'grid-cols-2 sm:grid-cols-3 [&>*:last-child]:col-span-2 sm:[&>*:last-child]:col-span-1'
        : items.length === 5
          ? 'grid-cols-2 sm:grid-cols-6 sm:[&>*]:col-span-2 sm:[&>*:nth-child(n+4)]:col-span-3 [&>*:last-child]:col-span-2 sm:[&>*:last-child]:col-span-3'
          : size === 'md' && long
            ? 'grid-cols-2'
            : 'grid-cols-2 lg:grid-cols-4'
  const valueSize =
    size === 'sm'
      ? 'text-xl md:text-2xl'
      : long
        ? 'text-xl md:text-2xl'
        : 'text-2xl md:text-[2rem] md:leading-9'

  return (
    <dl className={`grid-cells ${cols}`} aria-label={label}>
      {items.map((item) => (
        <div key={item.label} className="grid-cell flex min-w-0 flex-col-reverse gap-1.5 p-4 md:p-5">
          <dt className="label leading-4">{item.label}</dt>
          <dd className={`readout-value break-words ${valueSize} text-accent`}>{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}
