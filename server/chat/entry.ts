import { createChatHandler } from './handler'
import { toNodeHandler } from './node'

/**
 * Entry point bundled into api/chat.ts by scripts/build-api.ts.
 * Vercel invokes the default export as POST /api/chat.
 */
export default toNodeHandler(createChatHandler())
