  // server/middleware/auth.ts
  import { getUserFromEvent } from '../utils/supabaseServerClient'

  export default defineEventHandler(async (event) => {
    try {
      const user = await getUserFromEvent(event)
      // attach user to event.context for downstream handlers if desired
      ;(event as any).context = { ...(event as any).context, user }
      return // continue
    } catch (err: any) {
      // ensure we return a 401
      throw createError({ statusCode: 401, statusMessage: err?.statusMessage || err?.message || 'Unauthorized' })
    }
  })
