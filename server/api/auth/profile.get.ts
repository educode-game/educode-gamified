// /server/api/auth/profile.get.ts
import { createServiceSupabase, getUserFromToken } from '../../utils/supabaseServerClient'

interface Profile {
  id: string
  joined_at: string
  lives: number
  last_life_generated_at: string | null
}

export default defineEventHandler(async (event) => {
  const authorization = getRequestHeader(event, 'authorization') || ''
  const rawToken = authorization.replace('Bearer ', '').trim()
  const token: string = rawToken || ''   // ✅ force string type, never null

  if (!token) {
    throw createError({ statusCode: 401, message: 'Missing authorization token' })
  }

  const user = await getUserFromToken(token)
  if (!user) return { profile: null }

  const client = createServiceSupabase()
  const { data } = await client.from('profiles').select('*').eq('id', user.id).maybeSingle()
  if (!data) return { profile: null }

  const profile = data as Profile
  const now = new Date()

  const lastGenerated =
    profile.last_life_generated_at
      ? new Date(profile.last_life_generated_at)
      : profile.joined_at
      ? new Date(profile.joined_at)
      : now

  const diffMs = now.getTime() - lastGenerated.getTime()
  const added = Math.floor(diffMs / (30 * 60 * 1000)) // every 30 min

  if (added > 0 && Number(profile.lives ?? 0) < 5) {
    const newLives = Math.min(5, Number(profile.lives ?? 0) + added)
    await client
      .from('profiles')
      .update({
        lives: newLives,
        last_life_generated_at: new Date().toISOString()
      })
      .eq('id', user.id)
    profile.lives = newLives
    profile.last_life_generated_at = new Date().toISOString()
  }

  return { profile, user }
})
