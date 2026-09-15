import { factsText } from './facts'
import { askGemini, GeminiError } from './gemini'
import { buildSystemPrompt, NOT_SHARED, PAUSE_MESSAGE, RESTING_MESSAGE } from './prompt'
import { clientKey, DailyBudget, TokenBucketLimiter } from './rateLimit'
import { parseChatRequest, readJson } from './validate'

export interface HandlerDeps {
  env?: Record<string, string | undefined>
  fetchImpl?: typeof fetch
  limiter?: TokenBucketLimiter
  budget?: DailyBudget
  log?: (msg: string) => void
  sleep?: (ms: number) => Promise<void>
}

/**
 * Flash-lite class model. Google retires pinned versions for new keys (2.5 returned
 * 404 "no longer available to new users" in Sept 2026), so a 404 on the configured
 * model falls back once to the rolling alias.
 */
export const DEFAULT_MODEL = 'gemini-3.5-flash-lite'
export const FALLBACK_MODEL = 'gemini-flash-lite-latest'
export const RETRY_DELAY_MS = 700

function isTransient(err: unknown): boolean {
  if (err instanceof GeminiError) return err.status === 429 || err.status >= 500
  return err instanceof Error && err.name !== 'GeminiError' // network error or abort
}

function describe(err: unknown): string {
  if (err instanceof GeminiError) return `upstream ${err.status}`
  return err instanceof Error ? `${err.name}: ${err.message}` : String(err)
}

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
  // 5 requests/minute sustained with a burst of 6: every chip in a row is fine, a loop is not.
  const limiter = deps.limiter ?? new TokenBucketLimiter(5, 6)
  // Per instance per UTC day. A demo session is 5–10 questions; this covers hundreds of them.
  const budget = deps.budget ?? new DailyBudget(2000)
  const sleep = deps.sleep ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)))
  const log = deps.log ?? ((msg: string) => console.error(msg))
  const systemPrompt = buildSystemPrompt(factsText)

  return async function POST(request: Request): Promise<Response> {
    const limit = limiter.check(clientKey(request))
    if (!limit.allowed) {
      return json({ reply: PAUSE_MESSAGE, limited: true }, 429, { 'retry-after': String(limit.retryAfterSeconds) })
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

    const models = [env.GEMINI_MODEL || DEFAULT_MODEL, FALLBACK_MODEL].filter((m, i, all) => all.indexOf(m) === i)
    const ask = (model: string) =>
      askGemini({ apiKey, model, systemPrompt, message: parsed.message, fetchImpl: deps.fetchImpl })
    try {
      let text: string | null = null
      for (let i = 0; i < models.length; i++) {
        try {
          try {
            text = await ask(models[i])
          } catch (err) {
            // One retry for transient upstream trouble (overload, per-minute quota, network blip).
            if (!isTransient(err)) throw err
            log(`chat: transient failure on ${models[i]} (${describe(err)}), retrying once`)
            await sleep(RETRY_DELAY_MS)
            text = await ask(models[i])
          }
          break
        } catch (err) {
          const retirable = err instanceof GeminiError && err.status === 404 && i < models.length - 1
          if (!retirable) throw err
          log(`chat: model ${models[i]} returned 404, retrying with ${models[i + 1]}`)
        }
      }
      // A blocked or empty completion is treated as "not shared" rather than guessed at.
      return json({ reply: text ?? NOT_SHARED })
    } catch (err) {
      // Server logs only; the client always gets the resting message.
      if (err instanceof GeminiError) {
        log(`chat: upstream ${err.status}: ${err.detail || '(no body)'}`)
      } else {
        log(`chat: request failed: ${err instanceof Error ? `${err.name}: ${err.message}` : String(err)}`)
      }
      return json({ reply: RESTING_MESSAGE })
    }
  }
}
