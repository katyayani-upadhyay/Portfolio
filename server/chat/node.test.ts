import { describe, expect, it } from 'vitest'
import { toNodeHandler, type NodeRequest } from './node'
import type { ServerResponse } from 'node:http'

function fakeReq(init: { method?: string; body?: unknown; raw?: string; headers?: Record<string, string> }): NodeRequest {
  const raw = init.raw ?? ''
  const req = {
    method: init.method ?? 'POST',
    url: '/api/chat',
    headers: { host: 'example.test', 'content-type': 'application/json', ...init.headers },
    body: init.body,
    async *[Symbol.asyncIterator]() {
      if (raw) yield Buffer.from(raw)
    },
  }
  return req as unknown as NodeRequest
}

function fakeRes() {
  const headers: Record<string, string> = {}
  let ended: Buffer | undefined
  const res = {
    statusCode: 200,
    setHeader: (k: string, v: string) => {
      headers[k] = v
    },
    end: (b?: Buffer | string) => {
      ended = typeof b === 'string' ? Buffer.from(b) : b
    },
  }
  return { res: res as unknown as ServerResponse, headers, body: () => ended?.toString('utf8') ?? '', status: () => res.statusCode }
}

const echo = async (request: Request) =>
  new Response(
    JSON.stringify({
      method: request.method,
      ip: request.headers.get('x-forwarded-for'),
      body: await request.text(),
    }),
    { status: 201, headers: { 'content-type': 'application/json', 'x-test': 'yes' } },
  )

describe('toNodeHandler', () => {
  it('uses a pre-parsed body when the platform provides one', async () => {
    const handler = toNodeHandler(echo)
    const out = fakeRes()
    await handler(fakeReq({ body: { message: 'hi' }, headers: { 'x-forwarded-for': '203.0.113.1, 10.0.0.1' } }), out.res)
    expect(out.status()).toBe(201)
    expect(out.headers['x-test']).toBe('yes')
    expect(JSON.parse(out.body())).toEqual({ method: 'POST', ip: '203.0.113.1, 10.0.0.1', body: '{"message":"hi"}' })
  })

  it('reads the raw stream when no parsed body exists', async () => {
    const handler = toNodeHandler(echo)
    const out = fakeRes()
    await handler(fakeReq({ raw: '{"message":"raw"}' }), out.res)
    expect(JSON.parse(out.body()).body).toBe('{"message":"raw"}')
  })

  it('rejects non-POST methods with 405 and never calls the handler', async () => {
    let called = false
    const handler = toNodeHandler(async () => {
      called = true
      return new Response('x')
    })
    const out = fakeRes()
    await handler(fakeReq({ method: 'GET' }), out.res)
    expect(out.status()).toBe(405)
    expect(out.headers['allow']).toBe('POST')
    expect(called).toBe(false)
  })
})
