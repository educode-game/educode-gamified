// server/api/snippets/delete.post.ts
import { readBody, createError } from 'h3'
import { supabaseServer, getUserFromEvent } from '../../utils/supabaseServerClient'

export default defineEventHandler(async (event) => {
  const user = await getUserFromEvent(event)
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const body = await readBody(event) as { id?: string }
  if (!body?.id) throw createError({ statusCode: 400, message: 'Missing id' })

  const client = supabaseServer

  const { error } = await client
    .from('user_playground_snippets') // correct table
    .delete()
    .match({ id: body.id, user_id: user.id })

  if (error) {
    console.error('delete snippet error', error)
    throw createError({ statusCode: 500, message: 'Delete failed' })
  }

  return { success: true }
})
