// /server/api/leaderboard/update.post.ts
import { readBody } from 'h3'
import { createServiceSupabase } from '../../utils/supabaseServerClient'

export default defineEventHandler(async (event) => {
  const client = createServiceSupabase()
  const body = await readBody(event)

  const { user_id, xp_weekly } = body

  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)

  const { error } = await client.from('leaderboards').upsert({
    user_id,
    xp_weekly,
    week_start: weekStart.toISOString().slice(0, 10),
    week_end: weekEnd.toISOString().slice(0, 10)
  })

  if (error) return { error: error.message }

  return { success: true }
})
