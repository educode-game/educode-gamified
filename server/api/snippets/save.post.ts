import { readBody } from 'h3'
import { createServiceSupabase } from '../../utils/supabaseServerClient'

export default defineEventHandler(async (event) => {
  const client = createServiceSupabase()

  const authHeader = event.node.req.headers['authorization']
  if (!authHeader) return { error: 'Missing token' }

  const token = authHeader.replace('Bearer ', '')

  const { data: { user } } = await client.auth.getUser(token)
  if (!user) return { error: 'Invalid session' }

  const body = await readBody(event)

  const { title, code, language } = body

  const { error } = await client
    .from('user_playground_snippets')
    .insert({
      user_id: user.id,
      title,
      code,
      language
    })

  if (error) return { error: error.message }

  return { success: true }
})
