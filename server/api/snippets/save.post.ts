import { readBody, createError } from 'h3'
import { supabaseServer, getUserFromEvent } from '../../utils/supabaseServerClient'

export default defineEventHandler(async (event) => {
  const user = await getUserFromEvent(event)
  if (!user) throw createError({ statusCode: 401, message: "Unauthorized" })

  const { title, code, language } = await readBody(event)

  const { error } = await supabaseServer
    .from('user_playground_snippets')
    .insert({ user_id: user.id, title, code, language })

  if (error) throw createError({ statusCode: 500, message: error.message })

  return { success: true }
})
