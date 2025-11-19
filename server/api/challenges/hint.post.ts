import { supabaseServer, getUserFromEvent } from '../../utils/supabaseServerClient'
import { readBody, getRequestHeader } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // 🔥 Use new unified auth method
  const user = await getUserFromEvent(event)
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const { challenge_id, hint_number } = body
  if (!challenge_id || !hint_number) {
    throw createError({ statusCode: 400, message: 'challenge_id and hint_number required' })
  }

  const client = supabaseServer

  // check diamonds
  const { data: profile } = await client
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if ((profile?.diamonds || 0) < 1) {
    throw createError({ statusCode: 400, message: 'Not enough diamonds' })
  }

  // deduct 1 diamond
  await client
    .from('profiles')
    .update({ diamonds: (profile.diamonds || 0) - 1 })
    .eq('id', user.id)

  // record unlocked hint
  await client
    .from('user_hints')
    .insert({
      user_id: user.id,
      challenge_id,
      unlocked_hint_number: hint_number,
    })

  // return the hint text
  const { data: hint } = await client
    .from('challenge_hints')
    .select('*')
    .eq('challenge_id', challenge_id)
    .eq('hint_number', hint_number)
    .maybeSingle()

  return {
    success: true,
    hint: hint?.hint_text ?? 'Hint not found',
  }
})
