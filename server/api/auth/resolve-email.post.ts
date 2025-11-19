// /server/api/auth/resolve-email.post.ts
import { defineEventHandler, readBody } from 'h3'
import { supabaseServer } from '../../utils/supabaseServerClient'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { username } = body || {}

  if (!username) return { error: 'username required' }

 const client = supabaseServer
  const { data, error } = await client
    .from('profiles')
    .select('email')
    .eq('username', username)
    .single()

  if (error || !data?.email) return { error: 'Not found' }

  return { email: data.email }
})
