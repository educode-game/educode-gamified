// server/api/worlds/[id]/nodes-save.post.ts
import { readBody, createError } from 'h3'
import { supabaseServer, getUserFromEvent } from '../../../utils/supabaseServerClient'

/**
 * Accepts:
 * {
 *   nodes: [{ id: "<challenge-uuid>", x: number, y: number }, ...]
 * }
 *
 * Writes map_position JSON to `challenges.map_position`.
 *
 * NOTE: This endpoint should be restricted to admins/editors in production.
 */
export default defineEventHandler(async (event) => {
  // Optional: restrict to admin. For now, require authenticated user.
  const user = await getUserFromEvent(event)
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const params = event.context.params as Record<string, string>
  const worldId = params?.id
  if (!worldId) throw createError({ statusCode: 400, message: 'Missing world id (param)' })

  const body = await readBody(event) as { nodes?: Array<{ id: string, x?: number, y?: number }> }

  if (!Array.isArray(body?.nodes) || body.nodes.length === 0) {
    throw createError({ statusCode: 400, message: 'nodes array required' })
  }

  const client = supabaseServer

  // Confirm world exists (safety)
  const { data: world } = await client.from('worlds').select('id').eq('id', worldId).maybeSingle()
  if (!world) throw createError({ statusCode: 404, message: 'World not found' })

  // We'll update each challenge's map_position
  const results: { id: string, ok: boolean, error?: string }[] = []

  for (const n of body.nodes) {
    try {
      if (!n?.id) {
        results.push({ id: String(n?.id ?? ''), ok: false, error: 'missing id' })
        continue
      }

      const mp = { x: Number(n.x ?? 0), y: Number(n.y ?? 0) }

      // Only update rows that belong to this world to avoid accidental writes
      const { error } = await client
        .from('challenges')
        .update({ map_position: mp })
        .eq('id', n.id)
        .eq('world_id', worldId)

      if (error) {
        console.error('map_position update error for', n.id, error)
        results.push({ id: n.id, ok: false, error: error.message })
      } else {
        results.push({ id: n.id, ok: true })
      }
    } catch (err: any) {
      results.push({ id: n.id, ok: false, error: (err?.message || String(err)) })
    }
  }

  return { ok: true, results }
})
