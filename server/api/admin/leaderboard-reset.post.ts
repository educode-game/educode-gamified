// /server/api/admin/leaderboard-reset.post.ts
import { createServiceSupabase } from '../../utils/supabaseServerClient'

export default defineEventHandler(async (event) => {
  const adminSecret = getRequestHeader(event, 'x-admin-secret')
  const config = useRuntimeConfig()
  const baseUrl = String(config.public.baseUrl || '')

  if (adminSecret !== baseUrl.split('//')[1]) {
    throw createError({ statusCode: 403, message: 'Forbidden' })
  }

  const client = createServiceSupabase()
  const { data: profiles } = await client
    .from('profiles')
    .select('id, xp_weekly, xp_total')
    .order('xp_weekly', { ascending: false })

  if (!profiles) return { success: true }

  const weekStart = new Date()
  weekStart.setUTCDate(weekStart.getUTCDate() - ((weekStart.getUTCDay() + 6) % 7))
  const weekEnd = new Date(weekStart)
  weekEnd.setUTCDate(weekStart.getUTCDate() + 6)

  const payload = profiles.map((p, idx) => ({
    user_id: p.id,
    xp_weekly: p.xp_weekly,
    rank: idx + 1,
    week_start: weekStart.toISOString().slice(0, 10),
    week_end: weekEnd.toISOString().slice(0, 10)
  }))

  await client.from('leaderboards').insert(payload)
  await client.from('leaderboard_history').insert({ data: payload })
  await client.from('profiles').update({ xp_weekly: 0 })

  return { success: true }
})
