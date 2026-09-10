/**
 * Bundles server/chat/entry.ts into api/chat.ts.
 *
 * Vercel deploys whatever sits in api/ as a serverless function. Shipping one
 * self-contained file (no relative imports, no JSON imports, no TypeScript-only
 * syntax) removes every builder-specific way that a multi-file TypeScript
 * function can fail at invocation time. The facts are inlined at build time
 * from src/data/facts.json, so that file stays the single source of truth.
 *
 *   node scripts/build-api.ts          # write api/chat.ts
 *   node scripts/build-api.ts --check  # exit 1 if api/chat.ts is stale
 */
import { build } from 'esbuild'
import { readFileSync, writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

export const OUTPUT = 'api/chat.ts'

const BANNER = [
  '/*',
  ' * GENERATED FILE - do not edit by hand.',
  ' * Built by scripts/build-api.ts from server/chat/entry.ts so the Vercel',
  ' * function is a single self-contained module. Regenerate with:',
  ' *   npm run build:api',
  ' */',
].join('\n')

export async function bundleApi(): Promise<string> {
  const result = await build({
    entryPoints: ['server/chat/entry.ts'],
    bundle: true,
    platform: 'node',
    format: 'esm',
    target: 'node20',
    write: false,
    banner: { js: BANNER },
    legalComments: 'none',
    logLevel: 'silent',
  })
  return result.outputFiles[0].text
}

const invokedDirectly = process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href

if (invokedDirectly) {
  const code = await bundleApi()
  if (process.argv.includes('--check')) {
    let current = ''
    try {
      current = readFileSync(OUTPUT, 'utf8')
    } catch {
      current = ''
    }
    if (current !== code) {
      console.error(`${OUTPUT} is out of date. Run: npm run build:api`)
      process.exit(1)
    }
    console.log(`${OUTPUT} is up to date`)
  } else {
    writeFileSync(OUTPUT, code)
    console.log(`wrote ${OUTPUT} (${code.length} bytes)`)
  }
}
