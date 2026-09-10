import type { IncomingMessage, ServerResponse } from 'node:http'

type WebHandler = (request: Request) => Promise<Response>

/** Vercel pre-parses JSON bodies onto `req.body`; the Vite dev bridge does not. */
export type NodeRequest = IncomingMessage & { body?: unknown }

const FORWARDED_HEADERS = ['content-type', 'x-forwarded-for', 'x-real-ip'] as const

async function readBody(req: NodeRequest): Promise<string> {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'string') return req.body
    if (Buffer.isBuffer(req.body)) return req.body.toString('utf8')
    return JSON.stringify(req.body)
  }
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  return Buffer.concat(chunks).toString('utf8')
}

/**
 * Adapts the Web-standard handler to Node's (req, res) signature, which is
 * the oldest and most widely supported shape for a Vercel function.
 */
export function toNodeHandler(handler: WebHandler) {
  return async function nodeHandler(req: NodeRequest, res: ServerResponse): Promise<void> {
    if (req.method !== 'POST') {
      res.statusCode = 405
      res.setHeader('allow', 'POST')
      res.setHeader('content-type', 'application/json; charset=utf-8')
      res.end(JSON.stringify({ reply: 'Use POST with a JSON body.' }))
      return
    }

    const headers = new Headers()
    for (const name of FORWARDED_HEADERS) {
      const value = req.headers[name]
      if (typeof value === 'string') headers.set(name, value)
      else if (Array.isArray(value)) headers.set(name, value.join(', '))
    }

    const request = new Request(`https://${req.headers.host ?? 'localhost'}${req.url ?? '/api/chat'}`, {
      method: 'POST',
      headers,
      body: await readBody(req),
    })

    const response = await handler(request)
    res.statusCode = response.status
    response.headers.forEach((value, key) => res.setHeader(key, value))
    res.end(Buffer.from(await response.arrayBuffer()))
  }
}
