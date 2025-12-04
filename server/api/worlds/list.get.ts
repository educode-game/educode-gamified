// server/api/worlds/list.get.ts
import { supabaseServer } from '../../utils/supabaseServerClient'
import { createError } from 'h3'

export default defineEventHandler(async () => {
  const { data: worlds, error } = await supabaseServer
    .from('worlds')
    .select('id, name, code_name, language, total_nodes, map_background')
    .order('name', { ascending: true })

  if (error) {
    throw createError({ statusCode: 500, message: 'Failed to load worlds: ' + error.message })
  }

  return { worlds: worlds || [] }
})
