// /server/api/auth/signup.post.ts
import { defineEventHandler, readBody } from 'h3'
import { createServiceSupabase } from '../../utils/supabaseServerClient'

export default defineEventHandler(async (event) => {
  const client = createServiceSupabase()
  const body = await readBody(event)

  const { email, password, username } = body

  // Create account (server-side). NOTE: server-side signUp with service key
  // can be used, but client-side supabase.auth.signUp will be used in this bundle.
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NUXT_PUBLIC_SITE_URL || useRuntimeConfig().public.siteUrl || ''}/confirm`
    }
  })

  if (error || !data.user) {
    return { error: error?.message || "Signup failed." }
  }

  const user = data.user

  // Insert profile row (sync id)
  await client.from('profiles').insert({
    id: user.id,
    username,
    email,
    xp_total: 0,
    xp_weekly: 0,
    level: 1,
    diamonds: 0,
    lives: 5,
    hints: 0,
    badge_title: null,
    metadata: {},
    joined_at: new Date().toISOString(),
    last_life_generated_at: new Date().toISOString()
  }).maybeSingle()

  return { success: true }
})
