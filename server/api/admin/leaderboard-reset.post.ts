// server/api/admin/leaderboard-reset.post.ts
import { supabaseServer } from "../../utils/supabaseServerClient"
import { createError } from 'h3'

export default defineEventHandler(async () => {
  const client = supabaseServer

  try {
    // 1. Load current leaderboard
    const { data: entries, error: lbErr } = await client
      .from("leaderboard_weekly")
      .select("user_id, xp_earned")
      .order("xp_earned", { ascending: false })

    if (lbErr) throw lbErr
    if (!Array.isArray(entries)) throw new Error('No leaderboard entries found')

    const rewards = [
      { diamonds: 50, hints: 3 },
      { diamonds: 30, hints: 2 },
      { diamonds: 15, hints: 1 }
    ]

    // 2. Apply rewards (safe per-user updates)
    for (let i = 0; i < entries.length && i < 3; i++) {
      const { user_id } = entries[i]
      const r = rewards[i]

      if (!user_id) continue

      // increment diamonds using RPC (you have this RPC)
      try {
        await client.rpc("increment_diamonds", { uid: user_id, amount: r.diamonds })
      } catch (e) {
        console.error('increment_diamonds rpc failed, falling back to direct update', e)
        const { data: pr, error: pre } = await client.from('profiles').select('diamonds').eq('id', user_id).maybeSingle()
        const cur = (pr?.diamonds ?? 0) + r.diamonds
        await client.from('profiles').update({ diamonds: cur }).eq('id', user_id)
      }

      // increment hints via read+update (no RPC present)
      try {
        const { data: pr, error: pre } = await client.from('profiles').select('hints').eq('id', user_id).maybeSingle()
        if (pre) throw pre
        const curHints = (pr?.hints ?? 0) + r.hints
        await client.from('profiles').update({ hints: curHints }).eq('id', user_id)
      } catch (e) {
        console.error('increment hints failed for user', user_id, e)
      }
    }

    // 3. Reset xp_weekly for everyone (sets all to 0)
    await client.from("profiles").update({ xp_weekly: 0 }).neq('id', '')

    // 4. Clear leaderboard rows
    await client.from("leaderboard_weekly").delete()

    return { ok: true, message: "Leaderboard reset & rewards issued." }
  } catch (err: any) {
    console.error("RESET ERROR:", err)
    throw createError({ statusCode: 500, message: err.message || 'Reset failed' })
  }
})
