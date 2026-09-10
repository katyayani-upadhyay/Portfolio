import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { bundleApi, OUTPUT } from '../../scripts/build-api'

describe('api/chat.ts bundle', () => {
  it('is the current build of server/chat (run npm run build:api if this fails)', async () => {
    const committed = readFileSync(OUTPUT, 'utf8')
    expect(committed).toBe(await bundleApi())
  })

  it('is self-contained: no imports, facts inlined, resting message present', async () => {
    const code = await bundleApi()
    expect(code).not.toMatch(/^\s*import\s/m)
    expect(code).toMatch(/export \{[^}]*as default[^}]*\}/)
    expect(code).toContain('14,053')
    expect(code).toContain('The assistant is resting')
    expect(code).not.toMatch(/AIza[0-9A-Za-z_-]{20,}/)
  })
})
