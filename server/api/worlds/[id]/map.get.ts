// /server/api/worlds/[id]/map.get.ts
import { supabaseServer, getUserFromEvent } from '../../../utils/supabaseServerClient'

export default defineEventHandler(async (event) => {
  const params = event.context.params as Record<string, string>
  const id = params?.id

  if (!id) {
    throw createError({
      statusCode: 400,
      message: "Missing world id"
    })
  }

  // Logged-in user (optional)
  const user = await getUserFromEvent(event)

  const client = supabaseServer

  const { data: world } = await client
    .from('worlds')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (!world) {
    throw createError({
      statusCode: 404,
      message: 'World not found'
    })
  }

  const { data: challenges } = await client
    .from('challenges')
    .select('*')
    .eq('world_id', id)
    .order('order_index', { ascending: true })

  let progress: any[] = []
  if (user) {
    const { data: up } = await client
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id)

    progress = up || []
  }

  const enriched = (challenges || []).map((c: any) => {
    const p = progress.find((x) => x.challenge_id === c.id) || null
    return { ...c, user_progress: p }
  })

  return {
    world,
    challenges: enriched
  }
})
