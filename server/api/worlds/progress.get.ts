// /server/api/worlds/progress.get.ts
import { supabaseServer, getUserFromEvent } from '../../utils/supabaseServerClient'

export default defineEventHandler(async (event) => {
  const user = await getUserFromEvent(event)
  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    })
  }

  const query = getQuery(event)
  const world = query.world as string

  if (!world) {
    throw createError({
      statusCode: 400,
      message: 'Missing world'
    })
  }

  // Fetch progress
  const { data, error } = await supabaseServer
    .from('world_progress')
    .select('*')
    .eq('user_id', user.id)
    .eq('world', world)
    .maybeSingle()

  if (error) {
    console.error('world_progress error:', error)
    return {
      completed_nodes: [],
      unlocked_nodes: [1]
    }
  }

  return {
    completed_nodes: data?.completed_nodes ?? [],
    unlocked_nodes: data?.unlocked_nodes ?? [1]
  }
})
