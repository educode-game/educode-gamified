// server/api/worlds/init.post.ts
import { readBody, createError } from 'h3'
import { supabaseServer, getUserFromEvent } from '../../utils/supabaseServerClient'

export default defineEventHandler(async (event) => {
  const user = await getUserFromEvent(event)
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const body = await readBody(event) as { world_code?: string }
  const world_code = String(body?.world_code ?? '').trim()
  if (!world_code) throw createError({ statusCode: 400, message: 'world_code required' })

  const client = supabaseServer

  // Ensure world exists (by code_name)
  const { data: w } = await client
    .from('worlds')
    .select('id, code_name')
    .eq('code_name', world_code)
    .maybeSingle()

  if (!w) throw createError({ statusCode: 404, message: 'World not found' })

  // If progress exists, return it
  const { data: existing } = await client
    .from('world_progress')
    .select('id, completed_nodes, unlocked_nodes, updated_at')
    .eq('user_id', user.id)
    .eq('world_code', world_code)
    .maybeSingle()

  if (existing) {
    return {
      ok: true,
      existing: {
        id: existing.id,
        completed_nodes: Array.isArray(existing.completed_nodes) ? existing.completed_nodes : [],
        unlocked_nodes: Array.isArray(existing.unlocked_nodes) ? existing.unlocked_nodes : [1],
        updated_at: existing.updated_at
      }
    }
  }

  // Create initial progress
  const payload = {
    user_id: user.id,
    world_code,
    completed_nodes: [] as number[],
    unlocked_nodes: [1],
    updated_at: new Date().toISOString()
  }

  const { data: inserted, error } = await client
    .from('world_progress')
    .insert(payload)
    .select()
    .single()

  if (error) {
    console.error('world init insert error', error)
    throw createError({ statusCode: 500, message: 'Failed to initialize progress' })
  }

  return {
    ok: true,
    progress: {
      id: inserted.id,
      completed_nodes: Array.isArray(inserted.completed_nodes) ? inserted.completed_nodes : [],
      unlocked_nodes: Array.isArray(inserted.unlocked_nodes) ? inserted.unlocked_nodes : [1],
      updated_at: inserted.updated_at
    }
  }
})
