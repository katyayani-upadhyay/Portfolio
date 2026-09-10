import { defineConfig } from 'vitest/config'
import { loadEnv, type Plugin, type ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'
import type { IncomingMessage, ServerResponse } from 'node:http'

/**
 * In production the chatbot endpoint is the Vercel function api/chat.ts,
 * bundled from server/chat/entry.ts. Vite's dev server does not know about
 * that directory, so this plugin serves the same entry during `npm run dev`.
 */
function devApiBridge(env: Record<string, string>): Plugin {
  return {
    name: 'dev-api-bridge',
    apply: 'serve',
    configureServer(server: ViteDevServer) {
      for (const key of Object.keys(env)) {
        if (key.startsWith('GEMINI_') && process.env[key] === undefined) {
          process.env[key] = env[key]
        }
      }
      server.middlewares.use('/api/chat', async (req: IncomingMessage, res: ServerResponse) => {
        try {
          const mod = (await server.ssrLoadModule('/server/chat/entry.ts')) as {
            default: (req: IncomingMessage, res: ServerResponse) => Promise<void>
          }
          await mod.default(req, res)
        } catch (err) {
          server.config.logger.error(String(err))
          res.statusCode = 500
          res.setHeader('content-type', 'application/json')
          res.end(JSON.stringify({ reply: 'The assistant is resting — meanwhile, everything about Katyayani is on this page.' }))
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), devApiBridge(env)],
    build: {
      target: 'es2022',
      sourcemap: false,
    },
    test: {
      environment: 'node',
      include: ['src/**/*.test.ts', 'server/**/*.test.ts'],
    },
  }
})
