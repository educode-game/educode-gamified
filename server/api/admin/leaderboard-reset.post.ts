// server/api/admin/leaderboard-reset.post.ts
import { supabaseServer } from "../../utils/supabaseServerClient"

export default defineEventHandler(async (event) => {
  // Optional: You may restrict only admins
  // const user = await getUserFromEvent(event)
  // if (!user || user.role !== 'admin') throw createError({ ... })

  try {
    // RESET ALL XP
    const { error: xpErr } = await supabaseServer
      .from("profiles")
      .update({ xp_total: 0 })
      .neq("id", "") // ensures update applies to all rows

    if (xpErr) {
      console.error("Error updating profiles", xpErr)
      throw createError({ statusCode: 500, statusMessage: "Profile reset failed" })
    }

    // RESET PROGRESS TABLE
    const { error: progErr } = await supabaseServer
      .from("world_progress")
      .update({
        completed_nodes: [],
        unlocked_nodes: [1]
      })
      .neq("user_id", "") // apply to all users

    if (progErr) {
      console.error("Error resetting progress:", progErr)
      throw createError({ statusCode: 500, statusMessage: "Progress reset failed" })
    }

    return { ok: true, message: "Leaderboard reset completed." }

  } catch (err: any) {
    console.error("Reset error:", err)
    throw createError({
      statusCode: 500,
      statusMessage: err?.message ?? "Unexpected reset error"
    })
  }
})
