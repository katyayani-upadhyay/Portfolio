import { factsText } from './facts'
import { askGemini, GeminiError } from './gemini'
import { buildSystemPrompt, NOT_SHARED, RESTING_MESSAGE } from './prompt'
import { clientKey, DailyBudget, SlidingWindowLimiter } from './rateLimit'
import { parseChatRequest, readJson } from './validate'

export interface HandlerDeps {
  env?: Record<string, string | undefined>
  fetchImpl?: typeof fetch
  limiter?: SlidingWindowLimiter
  budget?: DailyBudget
  log?: (msg: string) => void
}

const DEFAULT_MODEL = 'gemini-2.5-flash-lite'

function json(body: Record<string, unknown>, status = 200, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...extra,
    },
  })
}

/**
 * Builds the POST /api/chat handler. Dependencies are injectable so the
 * behaviour can be tested without network access or real credentials.
 * Every failure path returns a friendly message; no error text or stack
 * ever reaches the client.
 */
export function createChatHandler(deps: HandlerDeps = {}) {
  const env = deps.env ?? process.env
  const limiter = deps.limiter ?? new SlidingWindowLimiter(8, 60_000)
  const budget = deps.budget ?? new DailyBudget(1500)
  const log = deps.log ?? ((msg: string) => console.error(msg))
  const systemPrompt = buildSystemPrompt(factsText)

  return async function POST(request: Request): Promise<Response> {
    const limit = limiter.check(clientKey(request))
    if (!limit.allowed) {
      return json(
        { reply: 'One question at a time, please. Try again in a moment.' },
        429,
        { 'retry-after': String(limit.retryAfterSeconds) },
      )
    }

    const parsed = parseChatRequest(await readJson(request))
    if (!parsed.ok) {
      return json({ reply: parsed.error }, 400)
    }

    const apiKey = env.GEMINI_API_KEY
    if (!apiKey) {
      log('chat: GEMINI_API_KEY is not configured')
      return json({ reply: RESTING_MESSAGE })
    }

    if (!budget.take()) {
      return json({ reply: RESTING_MESSAGE })
    }

    try {
      const text = await askGemini({
        apiKey,
        model: env.GEMINI_MODEL || DEFAULT_MODEL,
        systemPrompt,
        message: parsed.message,
        fetchImpl: deps.fetchImpl,
      })
      // A blocked or empty completion is treated as "not shared" rather than guessed at.
      return json({ reply: text ?? NOT_SHARED })
    } catch (err) {
      const status = err instanceof GeminiError ? err.status : 0
      log(`chat: upstream failure (${status || 'network'})`)
      return json({ reply: RESTING_MESSAGE })
    }
  }
}
