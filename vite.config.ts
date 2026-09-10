import { defineConfig } from 'vitest/config'
import { loadEnv, type Plugin, type ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'
import type { IncomingMessage, ServerResponse } from 'node:http'

/**
 * In production the chatbot endpoint is a Vercel function (api/chat.ts).
 * Vite's dev server does not know about that directory, so this plugin
 * bridges POST /api/chat to the same handler during `npm run dev`.
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
          const mod = (await server.ssrLoadModule('/api/chat.ts')) as {
            POST: (r: Request) => Promise<Response>
          }
          const chunks: Buffer[] = []
          for await (const chunk of req) chunks.push(chunk as Buffer)
          const request = new Request(`http://localhost${req.url ?? '/api/chat'}`, {
            method: req.method,
            headers: Object.entries(req.headers).flatMap(([k, v]) =>
              v === undefined ? [] : [[k, Array.isArray(v) ? v.join(',') : v] as [string, string]],
            ),
            body: req.method === 'POST' ? Buffer.concat(chunks) : undefined,
          })
          const response = req.method === 'POST' ? await mod.POST(request) : new Response(null, { status: 405 })
          res.statusCode = response.status
          response.headers.forEach((value, key) => res.setHeader(key, value))
          res.end(Buffer.from(await response.arrayBuffer()))
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
