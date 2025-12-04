// server/cron/regenerate-lives.ts
import { supabaseServer } from '../utils/supabaseServerClient'

export default defineEventHandler(async () => {
  const client = supabaseServer
  const { data: users, error } = await client
    .from('profiles')
    .select('id, lives, last_life_generated_at')

  if (error) {
    console.error('regenerate-lives select error', error)
    return { ok: false, error: error.message }
  }
  if (!users || users.length === 0) return { ok: true, message: 'No users found' }

  const now = Date.now()
  for (const user of users) {
    if ((user.lives ?? 0) >= 5) continue

    const lastTime = user.last_life_generated_at ? new Date(user.last_life_generated_at).getTime() : 0
    const diff = now - lastTime
    const regenTime = 30 * 60 * 1000 // 30 minutes

    if (diff >= regenTime) {
      try {
        await client
          .from('profiles')
          .update({
            lives: Math.min(5, (user.lives ?? 0) + 1),
            last_life_generated_at: new Date().toISOString()
          })
          .eq('id', user.id)
      } catch (err: any) {
        console.error('failed to regenerate life for user', user.id, err)
      }
    }
  }

  return { ok: true }
})
