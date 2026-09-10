import { createChatHandler } from '../server/chat/handler'

/**
 * Vercel serverless function: POST /api/chat
 * Grounded on src/data/facts.json, calls Gemini with GEMINI_API_KEY from the
 * environment. See server/chat/ for the implementation and tests.
 */
export const POST = createChatHandler()
