// server/api/badges/compute.get.ts
import { getUserFromEvent, supabaseServer } from '../../utils/supabaseServerClient'
import { computeBadgePoints, getBadgeTier } from '../../utils/badgeSystem'
import { createError } from 'h3'

export default defineEventHandler(async (event) => {
  const user = await getUserFromEvent(event)
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const client = supabaseServer

  // 1) get xp
  const { data: p } = await client.from('profiles').select('xp_total').eq('id', user.id).maybeSingle()
  const xp = Number(p?.xp_total ?? 0)

  // 2) count 3-star completions
  const { data: threeStarRows } = await client
    .from('user_progress')
    .select('id')
    .eq('user_id', user.id)
    .eq('stars', 3)
  const threeStarCount = Array.isArray(threeStarRows) ? threeStarRows.length : 0

  // 3) count languages completed (quick heuristic: distinct world prefixes in challenge_id)
  const { data: completed } = await client
    .from('user_progress')
    .select('challenge_id')
    .eq('user_id', user.id)
    .eq('completed', true)

  const languages = new Set<string>()
  if (Array.isArray(completed)) {
    for (const r of completed) {
      const cid = String((r as any).challenge_id || '')
      const prefix = cid.split('_')[0] || ''
      if (prefix) languages.add(prefix)
    }
  }

  const pts = computeBadgePoints(xp, threeStarCount, languages.size)
  const tier = getBadgeTier(pts)

  return {
    badgePoints: pts,
    badgeTier: tier,
    xp,
    threeStarCount,
    languagesCompleted: Array.from(languages)
  }
})
