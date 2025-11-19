// /server/api/auth/signup.post.ts
import { defineEventHandler, readBody } from 'h3'
import { supabaseServer } from '../../utils/supabaseServerClient'

export default defineEventHandler(async (event) => {
  const client = supabaseServer
  const body = await readBody(event)

  const { email, password, username } = body

  if (!email || !password || !username) {
    return { error: "All fields are required." }
  }

  const cleanEmail = email.toLowerCase().trim()
  const cleanUsername = username.trim().toLowerCase()

  /* ---------------------------------------------
     1) CHECK USERNAME IS UNIQUE
  ---------------------------------------------- */
  const { data: existingUser } = await client
    .from('profiles')
    .select('id')
    .eq('username', cleanUsername)
    .maybeSingle()

  if (existingUser) {
    return { error: "Username already taken. Pick another one." }
  }

  /* ---------------------------------------------
     2) CREATE AUTH USER + store username in metadata
  ---------------------------------------------- */
  const { data, error } = await client.auth.signUp({
    email: cleanEmail,
    password,
    options: {
      emailRedirectTo: `${process.env.NUXT_PUBLIC_SITE_URL}/confirm`,
      data: {
        username: cleanUsername
      }
    }
  })

  if (error || !data.user) {
    return { error: error?.message || "Signup failed." }
  }

  const user = data.user

  /* ---------------------------------------------
     3) UPSERT PROFILE (never errors on duplicates)
  ---------------------------------------------- */
  const { error: profileErr } = await client
    .from('profiles')
    .upsert(
      {
        id: user.id,
        username: cleanUsername,
        email: cleanEmail,
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
      },
      { onConflict: 'id' }
    )

  if (profileErr) {
    return { error: "Profile creation failed: " + profileErr.message }
  }

  return {
    success: true,
    message: "Signup successful — check your email to confirm."
  }
})
