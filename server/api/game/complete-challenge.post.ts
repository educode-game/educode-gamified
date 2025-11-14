import { readBody } from 'h3'
import { createServiceSupabase } from '../../utils/supabaseServerClient'
import { calculateXPEarned, checkLevelUp } from '../../utils/xpSystem'

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

  const xpEarned = calculateXPEarned(profile.level, stars)
  const newXP = profile.xp_total + xpEarned

  let newLevel = profile.level
  if (checkLevelUp(newXP, profile.level)) newLevel += 1

  await client
    .from('profiles')
    .update({
      xp_total: newXP,
      level: newLevel,
      xp_weekly: profile.xp_weekly + xpEarned
    })
    .eq('id', user.id)

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
