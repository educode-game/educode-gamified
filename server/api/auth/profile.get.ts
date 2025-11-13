// /server/api/auth/profile.get.ts
import { defineEventHandler, getHeader } from 'h3'
import { createServiceSupabase, getUserFromToken } from '../../utils/supabaseServerClient'

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader) return { profile: null }

  const token = (authHeader || '').replace('Bearer ', '')
  const user = await getUserFromToken(token)

  if (!user) return { profile: null }

  const client = createServiceSupabase()

  const { data: profileData, error } = await client
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    return { profile: null }
  }

  return {
    profile: profileData,
    user
  }
})
