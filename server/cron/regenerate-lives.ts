import { createServiceSupabase } from '../utils/supabaseServerClient'

export default defineEventHandler(async () => {
  const client = createServiceSupabase()

  const { data: users } = await client
    .from('profiles')
    .select('id, lives, last_life_generated_at')

  if (!users) return { ok: true, message: 'No users found' }

  const now = Date.now()

  for (const user of users) {
    if (user.lives >= 5) continue

    const last = new Date(user.last_life_generated_at).getTime()
    const diff = now - last

    const regenTime = 30 * 60 * 1000 // 30 minutes

    if (diff >= regenTime) {
      await client
        .from('profiles')
        .update({
          lives: Math.min(5, user.lives + 1),
          last_life_generated_at: new Date().toISOString()
        })
        .eq('id', user.id)
    }
  }

  return { ok: true }
})
