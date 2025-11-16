export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { userId, world, completedNode } = body

  if (!userId || !world || !completedNode)
    throw createError({ statusCode: 400, message: "Missing fields." })

  const client = event.context.supabase

  // fetch progress
  const { data: progress } = await client
    .from("world_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("world", world)
    .single()

  let completed_nodes: number[] = []
  let unlocked_nodes: number[] = [1]

  if (progress) {
    completed_nodes = progress.completed_nodes || []
    unlocked_nodes = progress.unlocked_nodes || [1]
  }

  // add completed node if not exists
  if (!completed_nodes.includes(completedNode)) {
    completed_nodes.push(completedNode)
  }

  // unlock next node
  const nextNode = completedNode + 1
  if (nextNode <= 15 && !unlocked_nodes.includes(nextNode)) {
    unlocked_nodes.push(nextNode)
  }

  const payload = {
    completed_nodes,
    unlocked_nodes,
    last_updated: new Date()
  }

  // update or insert
  if (progress) {
    await client
      .from("world_progress")
      .update(payload)
      .eq("id", progress.id)
  } else {
    await client.from("world_progress").insert({
      user_id: userId,
      world,
      ...payload
    })
  }

  return { ok: true, completed_nodes, unlocked_nodes }
})
