// server/api/challenges/hint.post.ts
import { readBody, createError } from 'h3'
import { supabaseServer, getUserFromEvent } from '../../utils/supabaseServerClient'
import { resolveChallengeBySlug } from '../../utils/challengeService'

export default defineEventHandler(async (event) => {
  const user = await getUserFromEvent(event)
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const body = await readBody(event) as { challenge_id?: string, challenge_slug?: string, hint_number?: number }
  const { challenge_id, challenge_slug } = body
  const hint_number = Number(body?.hint_number ?? 0)

  if (!challenge_id && !challenge_slug) throw createError({ statusCode: 400, message: 'challenge_id or challenge_slug required' })
  if (![1, 2, 3].includes(hint_number)) throw createError({ statusCode: 400, message: 'hint_number must be 1..3' })

  const client = supabaseServer

  // Resolve challenge UUID if the client passed a slug/questId
  let challengeUUID = challenge_id
  if (!challengeUUID) {
    const row = await resolveChallengeBySlug(String(challenge_slug))
    if (!row) throw createError({ statusCode: 404, message: 'Challenge not found' })
    challengeUUID = row.id
  }

  try {
    // Call atomic RPC: purchase_hint(uid, challenge_uuid, hint_number)
    const { data: rpcData, error: rpcErr } = await client.rpc('purchase_hint', {
      uid: user.id,
      challenge_uuid: challengeUUID,
      hint_number
    })

    if (rpcErr) {
      // Map Postgres exceptions surfaced via RPC to user-friendly messages
      const msg = String(rpcErr?.message ?? rpcErr?.details ?? rpcErr?.hint ?? '')
      if (msg.includes('Hint already unlocked')) {
        return { success: true, hint: 'already_unlocked' }
      }
      if (msg.includes('Not enough diamonds')) {
        throw createError({ statusCode: 400, message: 'Not enough diamonds' })
      }
      console.error('purchase_hint rpc error', rpcErr)
      throw createError({ statusCode: 500, message: 'Purchase failed' })
    }

    // rpcData should contain the new hint's UUID
    const newHintId = rpcData as string | null

    // Fetch the hint text from challenge_hints table
    const { data: hintRow, error: hintErr } = await client
      .from('challenge_hints')
      .select('hint_text')
      .eq('challenge_id', challengeUUID)
      .eq('hint_number', hint_number)
      .maybeSingle()

    if (hintErr) {
      console.error('challenge_hints select error', hintErr)
    }

    return {
      success: true,
      hintId: newHintId ?? null,
      hint: hintRow?.hint_text ?? null
    }
  } catch (err: any) {
    console.error('purchase_hint error', err)
    const msg = String(err?.message ?? '')
    if (msg.includes('Not enough diamonds')) {
      throw createError({ statusCode: 400, message: 'Not enough diamonds' })
    }
    if (msg.includes('Hint already unlocked')) {
      return { success: true, hint: 'already_unlocked' }
    }
    throw createError({ statusCode: 500, message: err?.message ?? 'Failed to purchase hint' })
  }
})
