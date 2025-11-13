// /server/api/auth/profile.get.ts
import { defineEventHandler, getHeader } from 'h3'
import { createServiceSupabase, getUserFromToken } from '../../utils/supabaseServerClient'

export default defineEventHandler(async (event) => {
  const auth = getHeader(event, 'authorization')
  if (!auth) return { profile: null }

  const token = auth.replace('Bearer ', '')
  const user = await getUserFromToken(token)

  if (!user) return { profile: null }

  const client = createServiceSupabase()

  // Fetch matching profile
  const { data: profile, error } = await client
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error("Profile fetch error:", error)
    return { profile: null }
  }

  // Return both user + profile
  return {
    profile,
    user: {
      id: user.id,
      email: user.email,
      username: user.user_metadata?.username || null
    }
  }
})
