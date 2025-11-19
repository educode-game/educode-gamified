import { supabaseServer } from '../../utils/supabaseServerClient'

export default defineEventHandler(async (event) => {
  const id = getQuery(event).id
  if (!id) throw createError({ statusCode: 400, message: 'id required' })
 const client = supabaseServer

  const { data } = await client.from('challenges').select('*').eq('id', id).maybeSingle()
  return { challenge: data }
})
