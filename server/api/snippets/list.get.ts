import { supabaseServer, getUserFromEvent } from '../../utils/supabaseServerClient'

export default defineEventHandler(async (event) => {
  const token = (getRequestHeader(event, 'authorization') || '').replace('Bearer ', '')
  const user = await getUserFromEvent(event)
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' })
const client = supabaseServer
  const { data } = await client.from('user_playground_snippets').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
  return { snippets: data }
})
