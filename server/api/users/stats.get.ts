// server/api/users/stats.get.ts
import { getUserFromEvent, supabaseServer } from '../../utils/supabaseServerClient'
import { createError } from 'h3'

export default defineEventHandler(async (event) => {
  const user = await getUserFromEvent(event)
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const client = supabaseServer

  // Fetch profile
  const { data: profile } = await client
    .from('profiles')
    .select('id, username, xp_total, xp_weekly, level, diamonds, lives, hints, joined_at')
    .eq('id', user.id)
    .maybeSingle()

  // Fetch ONLY this user’s progress
  const { data: progress } = await client
    .from('user_progress')
    .select('challenge_id, stars, completed, earned_xp, attempts, completed_at')
    .eq('user_id', user.id)        // ← FIXED: filter by current user
    .order('completed_at', { ascending: false })

  const totalCompleted = Array.isArray(progress)
    ? progress.filter((p: any) => p.completed).length
    : 0

  const threeStar = Array.isArray(progress)
    ? progress.filter((p: any) => p.stars === 3).length
    : 0

  const totalAttempts = Array.isArray(progress)
    ? progress.reduce((s: number, p: any) => s + (p.attempts ?? 0), 0)
    : 0

  return {
    profile,
    summary: {
      totalCompleted,
      threeStar,
      totalAttempts
    },
    progress: progress || []
  }
})
