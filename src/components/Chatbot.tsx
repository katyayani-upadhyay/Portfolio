import { AnimatePresence, m, useReducedMotion } from 'framer-motion'
import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { Chat, Close, Send } from './Icons'

export const MAX_CHARS = 500
export const RESTING_MESSAGE =
  'The assistant is resting — meanwhile, everything about Katyayani is on this page.'

const suggestions = [
  { text: 'What does the QuickCommerce Copilot do?', kind: 'grounded' },
  { text: 'How accurate is the GridLoad energy forecast?', kind: 'grounded' },
  { text: 'What are her GenAI and data engineering skills?', kind: 'grounded' },
  { text: 'What is the weather like today?', kind: 'off-topic' },
] as const

interface Message {
  id: number
  role: 'user' | 'assistant'
  text: string
}

async function askServer(message: string): Promise<string> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 25_000)
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ message }),
      signal: controller.signal,
    })
    const data = (await res.json().catch(() => null)) as { reply?: unknown } | null
    if (data && typeof data.reply === 'string' && data.reply.trim()) return data.reply
    return RESTING_MESSAGE
  } catch {
    return RESTING_MESSAGE
  } finally {
    clearTimeout(timer)
  }
}

export default function Chatbot() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [busy, setBusy] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const logRef = useRef<HTMLDivElement>(null)
  const nextId = useRef(1)
  const reduce = useReducedMotion()
  const titleId = useId()

  useEffect(() => {
    if (!open) return
    inputRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  useEffect(() => {
    const el = logRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, busy])

  async function send(text: string) {
    const trimmed = text.trim().slice(0, MAX_CHARS)
    if (!trimmed || busy) return
    setInput('')
    setMessages((prev) => [...prev, { id: nextId.current++, role: 'user', text: trimmed }])
    setBusy(true)
    const reply = await askServer(trimmed)
    setMessages((prev) => [...prev, { id: nextId.current++, role: 'assistant', text: reply }])
    setBusy(false)
    inputRef.current?.focus()
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    void send(input)
  }

  const panelMotion = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 8 },
        transition: { duration: 0.2, ease: [0.2, 0.6, 0.2, 1] as const },
      }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open ? (
          <m.section
            key="panel"
            {...panelMotion}
            role="dialog"
            aria-labelledby={titleId}
            className="flex h-[min(34rem,calc(100dvh-7rem))] w-[min(24rem,calc(100vw-2.5rem))] flex-col border border-line bg-raised shadow-[0_24px_60px_-20px_rgba(0,0,0,0.5)]"
          >
            <header className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
              <div>
                <h2 id={titleId} className="font-mono text-sm text-fg">
                  Ask about Katyayani
                </h2>
                <p className="label mt-1 normal-case tracking-normal">
                  Answers only from the facts on this page. Off-topic questions are declined.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close assistant"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-line text-fg hover:border-fg"
              >
                <Close />
              </button>
            </header>

            <div
              ref={logRef}
              className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
              role="log"
              aria-live="polite"
              aria-relevant="additions"
            >
              {messages.length === 0 ? (
                <div>
                  <p className="label mb-3">Try one</p>
                  <ul className="flex flex-col gap-2">
                    {suggestions.map((s) => (
                      <li key={s.text}>
                        <button
                          type="button"
                          onClick={() => void send(s.text)}
                          className="w-full border border-line px-3 py-2 text-left font-mono text-[0.8125rem] leading-5 text-fg transition-colors hover:border-fg"
                        >
                          {s.text}
                          {s.kind === 'off-topic' ? (
                            <span className="label ml-2 text-accent">off-topic test</span>
                          ) : null}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {messages.map((msg) => (
                <div key={msg.id} className={msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                  <p
                    className={
                      msg.role === 'user'
                        ? 'max-w-[85%] bg-fg px-3 py-2 font-mono text-[0.8125rem] leading-5 text-bg'
                        : 'max-w-[92%] border border-line px-3 py-2 text-[0.875rem] leading-relaxed text-fg'
                    }
                  >
                    {msg.text}
                  </p>
                </div>
              ))}

              {busy ? (
                <p className="label" aria-label="Assistant is thinking">
                  <span className={reduce ? '' : 'animate-pulse'}>Thinking</span>
                </p>
              ) : null}
            </div>

            <form onSubmit={onSubmit} className="border-t border-line p-3">
              <div className="flex items-center gap-2">
                <label htmlFor="chat-input" className="sr-only">
                  Your question
                </label>
                <input
                  id="chat-input"
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value.slice(0, MAX_CHARS))}
                  maxLength={MAX_CHARS}
                  placeholder="Ask about her projects, skills, or experience"
                  autoComplete="off"
                  disabled={busy}
                  className="min-w-0 flex-1 bg-transparent px-2 py-2 font-mono text-[0.8125rem] text-fg placeholder:text-muted focus:outline-none disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={busy || !input.trim()}
                  aria-label="Send"
                  className="flex h-9 w-9 shrink-0 items-center justify-center bg-fg text-bg transition-colors hover:bg-accent hover:text-accent-ink disabled:opacity-40"
                >
                  <Send />
                </button>
              </div>
              <p className="label mt-2 text-right normal-case tracking-normal">
                {input.length}/{MAX_CHARS}
              </p>
            </form>
          </m.section>
        ) : null}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="btn btn-primary shadow-[0_12px_30px_-12px_rgba(0,0,0,0.6)]"
      >
        {open ? <Close /> : <Chat />}
        {open ? 'Close' : 'Ask about Katyayani'}
      </button>
    </div>
  )
}
