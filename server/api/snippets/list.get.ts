import { createServiceSupabase, getUserFromToken } from '../../utils/supabaseServerClient'

export default defineEventHandler(async (event) => {
  const token = (getRequestHeader(event, 'authorization') || '').replace('Bearer ', '')
  const user = await getUserFromToken(token)
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' })
  const client = createServiceSupabase()
  const { data } = await client.from('user_playground_snippets').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
  return { snippets: data }
})
