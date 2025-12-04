// /server/api/worlds/[id]/map.get.ts
import { supabaseServer, getUserFromEvent } from '../../../utils/supabaseServerClient'
import { createError } from 'h3'
import { normalizeToCodeName } from '../../../utils/worldHelpers'

function looksLikeUUID(val: string) {
  // simple uuid v4-ish check
  return /^[0-9a-fA-F-]{36}$/.test(val)
}

export default defineEventHandler(async (event) => {
  const params = event.context.params as { id?: string }
  const rawId = params?.id
  if (!rawId) throw createError({ statusCode: 400, message: 'Missing world id' })

  const client = supabaseServer
  const user = await getUserFromEvent(event)

  // 🔹 Resolve world either by UUID or by code_name (slug)
  let world: any = null

  if (looksLikeUUID(rawId)) {
    const { data, error } = await client
      .from('worlds')
      .select('*')
      .eq('id', rawId)
      .maybeSingle()

    if (error) {
      console.error('world lookup by id failed', error)
      throw createError({ statusCode: 500, message: 'Failed to load world' })
    }
    world = data
  } else {
    const codeName = normalizeToCodeName(rawId)
    const { data, error } = await client
      .from('worlds')
      .select('*')
      .eq('code_name', codeName)
      .maybeSingle()

    if (error) {
      console.error('world lookup by code_name failed', error)
      throw createError({ statusCode: 500, message: 'Failed to load world' })
    }
    world = data
  }

  if (!world) throw createError({ statusCode: 404, message: 'World not found' })

  // 🔹 Challenges in this world
  const { data: challenges, error: chErr } = await client
    .from('challenges')
    .select('id, slug, title, difficulty, order_index')
    .eq('world_id', world.id)
    .order('order_index', { ascending: true })

  if (chErr) {
    console.error('challenges lookup failed', chErr)
    throw createError({ statusCode: 500, message: 'Failed to load challenges' })
  }

  // 🔹 Per-challenge progress
  let progressRows: any[] = []
  if (user) {
    const { data: up, error: upErr } = await client
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id)

    if (upErr) {
      console.error('user_progress lookup failed', upErr)
    }
    progressRows = up || []
  }

  const enriched = (challenges || []).map((c) => {
    const p = progressRows.find((x) => x.challenge_id === c.id) || null
    return { ...c, user_progress: p }
  })

  // 🔹 World-level progress for locking/unlocking
  let worldProgress: any = null
  if (user && world.code_name) {
    const { data: wp, error: wpErr } = await client
      .from('world_progress')
      .select('completed_nodes, unlocked_nodes, updated_at')
      .eq('user_id', user.id)
      .eq('world_code', world.code_name)
      .maybeSingle()

    if (wpErr) {
      console.error('world_progress lookup failed', wpErr)
    }
    if (wp) {
      worldProgress = {
        completed_nodes: Array.isArray(wp.completed_nodes) ? wp.completed_nodes : [],
        unlocked_nodes: Array.isArray(wp.unlocked_nodes) ? wp.unlocked_nodes : [1],
        updated_at: wp.updated_at
      }
    }
  }

  return {
    world,
    challenges: enriched,
    progress: worldProgress
  }
})
