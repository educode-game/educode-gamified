// /server/api/game/run-challenge.post.ts
import { readBody } from 'h3'
import { supabaseServer } from '../../utils/supabaseServerClient'


export default defineEventHandler(async (event) => {
  const { challenge_id, code, language } = await readBody(event)

  if (!challenge_id || !code || !language) {
    return { error: "Missing challenge_id / code / language" }
  }

  const client = supabaseServer

  // 1. Fetch challenge data
  const { data: challenge, error: chErr } = await client
    .from('challenges')
    .select('expected_output, xp_base')
    .eq('id', challenge_id)
    .single()

  if (chErr || !challenge) {
    return { error: "Challenge not found" }
  }

  // 2. TODO: Replace this with real sandbox runner
  // ----------------------------------------------
  const simulatedOutput = code.trim() // placeholder

  const expected = challenge.expected_output.trim()

  // 3. Compute stars
  let stars = 0
  if (simulatedOutput === expected) stars = 3
  else if (simulatedOutput && expected.includes(simulatedOutput)) stars = 2
  else if (simulatedOutput.length > 0) stars = 1
  else stars = 0

  return {
    success: true,
    stars,
    expected
  }
})
