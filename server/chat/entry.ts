import { createChatHandler } from './handler'
import { toNodeHandler } from './node'

/**
 * Entry point bundled into api/chat.ts by scripts/build-api.ts.
 * Vercel invokes the default export as POST /api/chat.
 */
/** Vercel function settings: allow a slow model call plus one retry. */
export const maxDuration = 30

export default toNodeHandler(createChatHandler())
