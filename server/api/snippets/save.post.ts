import { createServiceSupabase, getUserFromToken } from '../../utils/supabaseServerClient'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const token = (getRequestHeader(event, 'authorization') || '').replace('Bearer ', '')
  const user = await getUserFromToken(token)
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const client = createServiceSupabase()
  await client.from('user_playground_snippets').insert({
    user_id: user.id,
    language: body.language,
    title: body.title,
    code: body.code
  })
  return { success: true }
})
