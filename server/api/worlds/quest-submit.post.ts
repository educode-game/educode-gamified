// server/api/worlds/quest-submit.post.ts
import { loadQuestFile } from '../../utils/loadQuestFile'
import { runCodeInJudge0 } from '../../utils/judge0'
import { langToJudge0 } from "../../utils/langMap"
import type { EduCodeWorld } from "../../utils/langMap"
import { supabaseServer, getUserFromEvent } from '../../utils/supabaseServerClient'

export default defineEventHandler(async (event) => {
  // authenticate user
  const user = await getUserFromEvent(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" })
  }

  const body = await readBody(event)
  const world = (body.world as string) || ''
  const code = (body.code as string) || ''
  const questId = (body.questId as string) || ''

  if (!world || !code || !questId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing parameters' })
  }

  // load quest dataset
  let dataset: any[]
  try {
    dataset = loadQuestFile(world)
  } catch (err: any) {
    throw createError({ statusCode: 400, statusMessage: err?.message || 'Quest file error' })
  }

  const quest = dataset.find(q => q.questId === questId)
  if (!quest) throw createError({ statusCode: 404, statusMessage: 'Quest not found' })

  // get language id
  const languageId = langToJudge0[world as EduCodeWorld]
  if (!languageId) throw createError({ statusCode: 400, statusMessage: 'Unsupported language' })

  // run each test case via Judge0
  let allPassed = true
  let outputLog = ''

  for (const t of quest.testCases) {
    const stdin = (t.input ?? '').toString()
    const expected = (t.output ?? '').toString().trim()

    let result
    try {
      result = await runCodeInJudge0(languageId, code, stdin)
    } catch (err: any) {
      allPassed = false
      outputLog = err?.message || 'Judge0 execution error'
      break
    }

    const compileOut = (result.compile_output ?? '')?.toString() ?? ''
    const stderr = (result.stderr ?? '')?.toString() ?? ''
    const stdout = (result.stdout ?? '')?.toString() ?? ''

    if (compileOut && compileOut.trim().length > 0) {
      allPassed = false
      outputLog = `Compile Error:\n${compileOut}`
      break
    }

    if (stderr && stderr.trim().length > 0) {
      allPassed = false
      outputLog = `Runtime Error:\n${stderr}`
      break
    }

    if (stdout.trim() !== expected.trim()) {
      allPassed = false
      outputLog = `Expected: ${expected}\nGot: ${stdout.trim()}`
      break
    }
  }

  // award xp + update world_progress only if all testcases passed
  let xpAwarded = 0
  if (allPassed) {
    xpAwarded = quest.xp ?? 20

    try {
      // update profile xp_total
      const { data: profileData, error: profileErr } = await supabaseServer
        .from('profiles')
        .select('xp_total')
        .eq('id', user.id)
        .maybeSingle()

      if (profileErr) {
        console.error('supabase profiles select error', profileErr)
      } else {
        const newXp = (profileData?.xp_total ?? 0) + xpAwarded
        await supabaseServer.from('profiles').update({ xp_total: newXp }).eq('id', user.id)
      }

      // update or insert world_progress
      const { data: wpExisting, error: wpErr } = await supabaseServer
        .from('world_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('world', world)
        .maybeSingle()

      if (wpErr) {
        console.error('supabase world_progress select error', wpErr)
      } else {
        const completed = Array.isArray(wpExisting?.completed_nodes)
          ? [...wpExisting.completed_nodes]
          : []

        const unlocked = Array.isArray(wpExisting?.unlocked_nodes)
          ? [...wpExisting.unlocked_nodes]
          : [1]

        if (!completed.includes(quest.node)) completed.push(quest.node)

        const nextNode = (quest.node ?? 0) + 1
        if (nextNode <= 15 && !unlocked.includes(nextNode)) unlocked.push(nextNode)

        if (wpExisting) {
          await supabaseServer
            .from('world_progress')
            .update({ completed_nodes: completed, unlocked_nodes: unlocked })
            .eq('user_id', user.id)
            .eq('world', world)
        } else {
          await supabaseServer
            .from('world_progress')
            .insert({
              user_id: user.id,
              world,
              completed_nodes: completed,
              unlocked_nodes: unlocked
            })
        }
      }
    } catch (err) {
      console.error('Failed to update supabase after success:', err)
    }
  }

  return {
    ok: true,
    output: allPassed ? 'All test cases passed!' : outputLog,
    error: allPassed ? '' : outputLog,
    xp: xpAwarded
  }
})
