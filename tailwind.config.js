/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        raised: 'var(--bg-raised)',
        line: 'var(--line)',
        fg: 'var(--fg)',
        muted: 'var(--fg-muted)',
        accent: 'var(--accent)',
        'accent-ink': 'var(--accent-ink)',
      },
      fontFamily: {
        display: [
          '"Schibsted Grotesk Variable"',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          '"IBM Plex Mono"',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Consolas',
          'monospace',
        ],
      },
      maxWidth: {
        page: '72rem',
      },
      letterSpacing: {
        label: '0.08em',
      },
      fontSize: {
        label: ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.08em' }],
        readout: ['2rem', { lineHeight: '2.25rem' }],
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.2, 0.6, 0.2, 1)',
      },
      boxShadow: {
        panel: 'var(--shadow)',
        lift: 'var(--shadow-lift)',
      },
    },
  },
  plugins: [],
}
