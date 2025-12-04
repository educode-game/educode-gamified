import { supabaseServer, getUserFromEvent } from '../../utils/supabaseServerClient'

export default defineEventHandler(async (event) => {
  const user = await getUserFromEvent(event)
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const { data } = await supabaseServer
    .from('user_playground_snippets')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return { snippets: data }
})
