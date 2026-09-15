export interface GeminiOptions {
  apiKey: string
  model: string
  systemPrompt: string
  message: string
  fetchImpl?: typeof fetch
  baseUrl?: string
  timeoutMs?: number
}

export class GeminiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    /** First few hundred chars of the upstream body, for server logs only. */
    readonly detail = '',
  ) {
    super(message)
    this.name = 'GeminiError'
  }
}

interface GeminiResponse {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> }
    finishReason?: string
  }>
  promptFeedback?: { blockReason?: string }
}

/**
 * Minimal call to Gemini's generateContent REST endpoint with plain fetch,
 * so the serverless function carries no SDK weight. Returns the reply text,
 * or null when the model produced nothing usable.
 */
export async function askGemini(opts: GeminiOptions): Promise<string | null> {
  const {
    apiKey,
    model,
    systemPrompt,
    message,
    fetchImpl = fetch,
    baseUrl = 'https://generativelanguage.googleapis.com/v1beta',
    timeoutMs = 20_000,
  } = opts

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetchImpl(`${baseUrl}/models/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: message }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 220,
          candidateCount: 1,
        },
      }),
      signal: controller.signal,
    })

    if (!res.ok) {
      const detail = (await res.text().catch(() => '')).slice(0, 400)
      throw new GeminiError(`upstream ${res.status}`, res.status, detail)
    }

    const data = (await res.json()) as GeminiResponse
    if (data.promptFeedback?.blockReason) return null
    const text = data.candidates?.[0]?.content?.parts
      ?.map((p) => p.text ?? '')
      .join('')
      .trim()
    return text ? text : null
  } finally {
    clearTimeout(timer)
  }
}
