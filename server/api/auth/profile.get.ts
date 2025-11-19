import { defineEventHandler } from 'h3'
import { supabaseServer } from '../../utils/supabaseServerClient'

export default defineEventHandler(async (event) => {
const client = supabaseServer


  const authHeader = event.node.req.headers['authorization']
  if (!authHeader) return { error: 'Missing auth' }

  const token = authHeader.replace('Bearer ', '')

  const { data: { user }, error: userErr } = await client.auth.getUser(token)
  if (userErr || !user) return { error: 'Invalid token' }

  const { data: profile, error } = await client
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) return { error: error.message }

  return { profile }
})
