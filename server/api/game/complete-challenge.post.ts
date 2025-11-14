import { readBody } from 'h3'
import { createServiceSupabase } from '../../utils/supabaseServerClient'
import { calculateChallengeXP, getXPRequiredForLevel } from '../../utils/xpSystem'

export default defineEventHandler(async (event) => {
  const client = createServiceSupabase()
  const body = await readBody(event)
  const { challenge_id, stars } = body

  const token = event.node.req.headers.authorization?.replace("Bearer ", "")
  if (!token) return { error: "Missing token" }

  const { data: { user } } = await client.auth.getUser(token)
  if (!user) return { error: "Not authorized" }

  const { data: profile } = await client
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // XP
  const xpEarned = calculateChallengeXP(profile.level, stars)
  const newXP = profile.xp_total + xpEarned

  // Level up
  const requiredXP = getXPRequiredForLevel(profile.level)
  const willLevelUp = newXP >= requiredXP

  const newLevel = willLevelUp ? profile.level + 1 : profile.level

  // Update profile
  await client.from('profiles').update({
    xp_total: newXP,
    xp_weekly: profile.xp_weekly + xpEarned,
    level: newLevel
  }).eq('id', user.id)

  // Save progress
  await client.from('user_progress').upsert({
    user_id: user.id,
    challenge_id,
    stars,
    earned_xp: xpEarned,
    completed: stars > 0,
    completed_at: new Date().toISOString()
  })

  return {
    success: true,
    xpEarned,
    newXP,
    newLevel
  }
})
