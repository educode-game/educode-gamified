import { defineEventHandler, readBody } from 'h3'
import { supabaseServer } from '../../utils/supabaseServerClient'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { userId, username, email } = body || {}

  if (!userId || !username || !email) {
    return { error: 'Missing userId/username/email' }
  }

  const client = supabaseServer

  const { data, error } = await client
    .from('profiles')
    .upsert(
      {
        id: userId,
        username,
        email,
        xp_total: 0,
        xp_weekly: 0,
        level: 1,
        diamonds: 0,
        lives: 5,
        hints: 0,
        badge_title: null,
        metadata: {},
        joined_at: new Date().toISOString(),
        last_life_generated_at: new Date().toISOString()
      },
      { onConflict: 'id' }
    )
    .select()
    .single()

  if (error) return { error: error.message }

  return { success: true, profile: data }
})
