export default defineEventHandler(async (event) => {
  const world = getQuery(event).world
  const userId = event.context.user?.id

  if (!userId)
    throw createError({ statusCode: 401, message: "Not authenticated" })

  const client = event.context.supabase

  const { data } = await client
    .from("world_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("world", world)
    .single()

  return data || { completed_nodes: [], unlocked_nodes: [1] }
})
