// /server/api/worlds/quest-submit.post.ts

import { readBody, createError } from "h3"
import { supabaseServer, getUserFromEvent } from "../../utils/supabaseServerClient"
import { loadQuestFile } from "../../utils/loadQuestFile"
import { runCodeInJudge0 } from "../../utils/judge0"
import { worldKeyFromCode } from "../../utils/worldHelpers"
import { langToJudge0 } from "../../utils/langMap"
import { calculateXPEarned, checkLevelUp } from "../../utils/xpSystem"

type StarT = 0 | 1 | 2 | 3

export default defineEventHandler(async (event) => {
  const user = await getUserFromEvent(event)
  if (!user) throw createError({ statusCode: 401, message: "Unauthorized" })

  const body = await readBody(event)
  const world_code = String(body.world_code ?? "").trim()
  const node_id = Number(body.node_id)
  const code = String(body.code ?? "")

  if (!world_code || !node_id || !code)
    throw createError({ statusCode: 400, message: "Missing fields" })

  const worldKey = worldKeyFromCode(world_code)
  if (!["cpp", "python", "java"].includes(worldKey))
    throw createError({ statusCode: 400, message: "Invalid world" })

  const quests = loadQuestFile(worldKey)
  const quest = quests.find(q => Number(q.node) === node_id)
  if (!quest) throw createError({ statusCode: 404, message: "Quest not found" })

  const slug = quest.slug || quest.questId
  if (!slug) throw createError({ statusCode: 500, message: "Quest missing slug" })

  const client = supabaseServer

  const { data: challenge } = await client
    .from("challenges")
    .select("id, xp_base")
    .eq("slug", slug)
    .maybeSingle()

  if (!challenge) {
    throw createError({
      statusCode: 500,
      message: `Challenge '${slug}' missing in DB — Run Import Script`
    })
  }

  const challengeUUID = challenge.id
  const xpBaseLevel = Number(challenge.xp_base ?? 1) || 1

  // --- Run via Judge0 ---
  const testCases = quest.testCases ?? []
  const langId = langToJudge0[worldKey as keyof typeof langToJudge0]

  const outputs = await Promise.all(
    testCases.map((tc: any) =>
      runCodeInJudge0(langId, code, tc.input ?? "")
        .then(r => String(r.stdout ?? "").trim())
        .catch(() => "__JUDGE_ERROR__")
    )
  )

  // ❌ Hard failure → lose life
  if (outputs.includes("__JUDGE_ERROR__")) {
    try {
      await client.rpc("update_lives", { uid: user.id, amount: -1 })
    } catch (err) {
      console.error("update_lives RPC failed:", err)
    }

    const { data: updatedProfile } = await client
      .from("profiles")
      .select("lives")
      .eq("id", user.id)
      .maybeSingle()

    return {
      ok: false,
      stars: 0,
      xpEarned: 0,
      level_up: false,
      diamonds_awarded: 0,
      lifeLost: true,
      remainingLives: updatedProfile?.lives ?? null,
      output: outputs.join("\n"),
      error: "Execution failed"
    }
  }

  // ⭐ Star logic
  const expected = testCases.map((t: any) => String(t.output ?? "").trim())
  const passed = outputs.filter((o, i) => o === expected[i]).length
  const pct = (passed / expected.length) * 100

  let stars: StarT = 0
  if (pct === 100) stars = 3
  else if (pct >= 80) stars = 2
  else if (pct >= 60) stars = 1

  // --- Previous progress ---
  const { data: prev } = await client
    .from("user_progress")
    .select("stars, attempts, earned_xp, completed")
    .eq("user_id", user.id)
    .eq("challenge_id", challengeUUID)
    .maybeSingle()

  const prevStars = (prev?.stars ?? 0) as StarT
  const wasCompleted = prev?.completed ?? false

  // XP for this challenge at old/new star counts
  const totalXpForPrev = calculateXPEarned(xpBaseLevel, prevStars)
  const totalXpForNow  = calculateXPEarned(xpBaseLevel, stars)

  // Reward only improvement
  const xpEarned = stars > prevStars ? (totalXpForNow - totalXpForPrev) : 0

  // --- Upsert user_progress ---
  await client
    .from("user_progress")
    .upsert(
      [{
        user_id: user.id,
        challenge_id: challengeUUID,
        stars,
        attempts: (prev?.attempts ?? 0) + 1,
        // store best total XP for this challenge
        earned_xp: Math.max(prev?.earned_xp ?? 0, totalXpForNow),
        completed: stars > 0,
        completed_at: stars > 0 ? new Date().toISOString() : null,
        last_attempt_output: outputs.join("\n")
      }],
      { onConflict: "user_id,challenge_id" }
    )

  // --- XP & Level updates ---
  let newLevel: number | null = null
  let level_up = false
  let diamonds_awarded = 0

  if (xpEarned > 0) {
    const { data: profile } = await client
      .from("profiles")
      .select("xp_total, level")
      .eq("id", user.id)
      .maybeSingle()

    const currentXp = profile?.xp_total ?? 0
    const currentLevel = profile?.level ?? 1
    const updatedXP = currentXp + xpEarned

    await client
      .from("profiles")
      .update({ xp_total: updatedXP })
      .eq("id", user.id)

    if (checkLevelUp(updatedXP, currentLevel)) {
      newLevel = currentLevel + 1
      level_up = true
      await client
        .from("profiles")
        .update({ level: newLevel })
        .eq("id", user.id)
    }

    // 💎 Award diamond for first completion
    if (!wasCompleted && stars > 0) {
      try {
        await client.rpc("increment_diamonds", { uid: user.id, amount: 1 })
        diamonds_awarded = 1
      } catch (err) {
        console.error("increment_diamonds RPC failed:", err)
      }
    }
  }

  const { data: finalProfile } = await client
    .from("profiles")
    .select("lives")
    .eq("id", user.id)
    .maybeSingle()

  return {
    ok: true,
    stars,
    xpEarned,
    level_up,
    newLevel,
    diamonds_awarded,
    remainingLives: finalProfile?.lives ?? null,
    output: outputs.join("\n")
  }
})
