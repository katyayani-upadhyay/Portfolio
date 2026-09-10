export const MAX_MESSAGE_CHARS = 500

export type ParsedRequest = { ok: true; message: string } | { ok: false; error: string }

/**
 * Accepts the raw JSON body of POST /api/chat and returns a clean message or
 * a short, user-safe error. Never echoes the input back in the error.
 */
export function parseChatRequest(body: unknown): ParsedRequest {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'Send a JSON object with a "message" field.' }
  }
  const raw = (body as Record<string, unknown>).message
  if (typeof raw !== 'string') {
    return { ok: false, error: 'The "message" field must be a string.' }
  }
  const message = raw.replace(/\s+/g, ' ').trim()
  if (message.length === 0) {
    return { ok: false, error: 'Ask a question first.' }
  }
  if (message.length > MAX_MESSAGE_CHARS) {
    return { ok: false, error: `Keep questions under ${MAX_MESSAGE_CHARS} characters.` }
  }
  return { ok: true, message }
}

/** Parses a JSON body defensively; malformed JSON becomes `undefined`. */
export async function readJson(request: Request): Promise<unknown> {
  try {
    const text = await request.text()
    if (text.length > 4096) return undefined
    return JSON.parse(text)
  } catch {
    return undefined
  }
}
