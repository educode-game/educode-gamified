// server/api/shop/buy-hint.post.ts
import { readBody, createError } from 'h3'
import { supabaseServer, getUserFromEvent } from '../../utils/supabaseServerClient'

/**
 * Buy a hint using diamonds.
 * Request body: { price?: number }  // price optional; default 5 diamonds
 */
export default defineEventHandler(async (event) => {
  const user = await getUserFromEvent(event)
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const body = await readBody(event) as { price?: number }
  const price = Number(body?.price ?? 5)
  if (price <= 0) throw createError({ statusCode: 400, message: 'Invalid price' })

  const client = supabaseServer

  const { data: profile } = await client
    .from('profiles')
    .select('diamonds, hints')
    .eq('id', user.id)
    .single()

  if (!profile) throw createError({ statusCode: 404, message: 'Profile not found' })

  if ((profile.diamonds ?? 0) < price) throw createError({ statusCode: 400, message: 'Not enough diamonds' })

  const updates = {
    diamonds: (profile.diamonds ?? 0) - price,
    hints: (profile.hints ?? 0) + 1
  }

  const { error } = await client.from('profiles').update(updates).eq('id', user.id)
  if (error) {
    console.error('buy-hint failed', error)
    throw createError({ statusCode: 500, message: 'Purchase failed' })
  }

  return { success: true, price, newHints: updates.hints, newDiamonds: updates.diamonds }
})
