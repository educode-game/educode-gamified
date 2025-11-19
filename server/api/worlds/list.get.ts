// /server/api/worlds/list.get.ts
import { supabaseServer } from '../../utils/supabaseServerClient'

export default defineEventHandler(async () => {
  const { data: worlds, error } = await supabaseServer
    .from('worlds')
    .select('*')

  if (error) {
    throw createError({
      statusCode: 500,
      message: 'Failed to load worlds: ' + error.message
    })
  }

  // Optional: sort locally by id or name
  const sorted = (worlds || []).sort((a: any, b: any) =>
    (a.name || '').localeCompare(b.name || '')
  )

  return { worlds: sorted }
})
