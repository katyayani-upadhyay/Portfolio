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
  // A four-cell strip with a long value (e.g. 50%→100%) drops to 2×2 so numerals keep one size.
  const long = size === 'md' && items.some((item) => item.value.length >= 7)
  const cols =
    items.length <= 2
      ? 'grid-cols-2'
      : items.length === 3
        ? 'grid-cols-3'
        : items.length === 5
          ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'
          : long
            ? 'grid-cols-2'
            : 'grid-cols-2 lg:grid-cols-4'
  const valueSize = size === 'md' ? 'text-2xl md:text-[2rem] md:leading-9' : 'text-xl md:text-2xl'

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
