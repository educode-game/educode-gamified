import { createServiceSupabase, getUserFromToken } from '../../utils/supabaseServerClient'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const token = (getRequestHeader(event, 'authorization') || '').replace('Bearer ', '')
  const user = await getUserFromToken(token)
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const { challenge_id, hint_number } = body
  if (!challenge_id || !hint_number) throw createError({ statusCode: 400, message: 'challenge_id and hint_number required' })

  const client = createServiceSupabase()
  const { data: profile } = await client.from('profiles').select('*').eq('id', user.id).maybeSingle()
  if ((profile.diamonds || 0) < 1) throw createError({ statusCode: 400, message: 'Not enough diamonds' })

  await client.from('profiles').update({ diamonds: (profile.diamonds || 0) - 1 }).eq('id', user.id)
  await client.from('user_hints').insert({ user_id: user.id, challenge_id, unlocked_hint_number: hint_number })
  const { data: hint } = await client.from('challenge_hints').select('*').eq('challenge_id', challenge_id).eq('hint_number', hint_number).maybeSingle()
  return { success: true, hint: hint?.hint_text ?? 'Hint not found' }
})
