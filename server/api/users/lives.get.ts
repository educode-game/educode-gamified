// server/api/users/lives.get.ts

import { supabaseServer, getUserFromEvent } from "../../utils/supabaseServerClient"
import { createError } from "h3"

const MAX_LIVES = 5
const RECHARGE_MINUTES = 30

export default defineEventHandler(async (event) => {
  const user = await getUserFromEvent(event)
  if (!user) throw createError({ statusCode: 401, message: "Unauthorized" })

  const client = supabaseServer

  const { data: profile } = await client
    .from("profiles")
    .select("lives, last_life_generated_at")
    .eq("id", user.id)
    .maybeSingle()

  if (!profile) throw createError({ statusCode: 500, message: "Profile not found" })

  let { lives, last_life_generated_at } = profile

  // Already full?
  if (lives >= MAX_LIVES) {
    return {
      ok: true,
      lives: MAX_LIVES,
      maxLives: MAX_LIVES,
      nextRechargeMinutes: 0,
      lastUpdated: last_life_generated_at // <-- ADDED
    }
  }

  // Regen logic
  const last = new Date(last_life_generated_at)
  const now = new Date()
  const minutesPassed = Math.floor((now.getTime() - last.getTime()) / 60000)
  const livesRecovered = Math.floor(minutesPassed / RECHARGE_MINUTES)

  if (livesRecovered > 0) {
    lives = Math.min(MAX_LIVES, lives + livesRecovered)

    await client.from("profiles").update({
      lives,
      last_life_generated_at: now.toISOString()
    }).eq("id", user.id)

    last_life_generated_at = now.toISOString()
  }

  const remainingToNext = RECHARGE_MINUTES - (minutesPassed % RECHARGE_MINUTES)

  return {
    ok: true,
    lives,
    maxLives: MAX_LIVES,
    nextRechargeMinutes: lives >= MAX_LIVES ? 0 : remainingToNext,
    lastUpdated: last_life_generated_at // <-- ADDED (MATCHES COMPOSABLE EXPECTATION)
  }
})
