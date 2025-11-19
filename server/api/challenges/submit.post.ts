// /server/api/challenges/submit.post.ts
import { supabaseServer, getUserFromEvent } from '../../utils/supabaseServerClient'
import { readBody, getRequestHeader } from 'h3'

interface Challenge {
  id: string
  expected_output: string
  xp_base: number
  difficulty: string
}

interface Profile {
  id: string
  xp_total: number
  xp_weekly: number
  level: number
  lives: number
  diamonds: number
  last_life_generated_at: string | null
}

function computeStars(output: string, expected: string): number {
  const a = (output || '').trim()
  const b = (expected || '').trim()
  if (!a) return 0
  if (a === b) return 3
  const ratio = Math.min(a.length, b.length) / Math.max(1, Math.max(a.length, b.length))
  if (ratio > 0.8) return 2
  if (ratio > 0.5) return 1
  return 0
}

function getXpRequired(n: number): number {
  const raw = 200 * Math.pow(1.15, n - 1)
  return Math.round(raw / 50) * 50
}

function computeLevelFromXp(xpTotal: number): number {
  let level = 1
  let remaining = xpTotal
  while (true) {
    const req = getXpRequired(level)
    if (remaining >= req) {
      remaining -= req
      level++
    } else break
    if (level > 200) break
  }
  return level
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    challenge_id: string
    output: string
  }>(event)

  // 🔥 NEW AUTH METHOD
  const user = await getUserFromEvent(event)
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const client = supabaseServer

  const { data: ch } = await client
    .from('challenges')
    .select('*')
    .eq('id', body.challenge_id)
    .maybeSingle()

  if (!ch) throw createError({ statusCode: 404, message: 'Challenge not found' })

  const challenge = ch as Challenge

  const stars = computeStars(body.output, challenge.expected_output)
  const earned_xp =
    stars > 0
      ? Math.round(challenge.xp_base * (stars === 3 ? 1.0 : stars === 2 ? 0.8 : 0.6))
      : 0

  const { data: existing } = await client
    .from('user_progress')
    .select('*')
    .match({ user_id: user.id, challenge_id: challenge.id })
    .maybeSingle()

  const attempts = (existing?.attempts ?? 0) + 1
  const completed = stars > 0

  if (existing) {
    await client
      .from('user_progress')
      .update({
        stars: Math.max(existing.stars ?? 0, stars),
        completed: existing.completed || completed,
        earned_xp: Math.max(existing.earned_xp ?? 0, earned_xp),
        attempts,
        last_attempt_output: body.output,
        completed_at: completed
          ? new Date().toISOString()
          : existing.completed_at,
      })
      .match({ id: existing.id })
  } else {
    await client.from('user_progress').insert({
      user_id: user.id,
      challenge_id: challenge.id,
      stars,
      completed,
      earned_xp,
      attempts,
      last_attempt_output: body.output,
      completed_at: completed ? new Date().toISOString() : null,
    })
  }

  const { data: prof } = await client
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (!prof) throw createError({ statusCode: 404, message: 'Profile not found' })
  const profile = prof as Profile

  let new_xp_total = Number(profile.xp_total ?? 0)
  let new_xp_week = Number(profile.xp_weekly ?? 0)
  let level_up = false
  let diamonds_awarded = 0
  const updatedFields: Record<string, any> = {}

  if (earned_xp > 0) {
    new_xp_total += earned_xp
    new_xp_week += earned_xp
    const oldLevel = Number(profile.level ?? 1)
    const newLevel = computeLevelFromXp(new_xp_total)
    if (newLevel > oldLevel) {
      level_up = true
      const tier = Math.min(Math.floor(newLevel / 10) + 1, 5)
      diamonds_awarded = tier
      updatedFields.diamonds = Number(profile.diamonds ?? 0) + diamonds_awarded
      updatedFields.level = newLevel
    }
    updatedFields.xp_total = new_xp_total
    updatedFields.xp_weekly = new_xp_week
  } else {
    const livesLeft = Math.max(0, Number(profile.lives ?? 5) - 1)
    updatedFields.lives = livesLeft
    if (!profile.last_life_generated_at) {
      updatedFields.last_life_generated_at = new Date().toISOString()
    }
  }

  await client.from('profiles').update(updatedFields).eq('id', user.id)

  return {
    success: true,
    stars,
    earned_xp,
    diamonds_awarded,
    level_up,
  }
})
