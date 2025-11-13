// /server/api/auth/signup.post.ts
import { defineEventHandler, readBody } from 'h3'
import { createServiceSupabase } from '../../utils/supabaseServerClient'

export default defineEventHandler(async (event) => {
  const client = createServiceSupabase()
  const body = await readBody(event)

  const { email, password, username } = body

  // 1️⃣ Create account with username stored in user_metadata
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NUXT_PUBLIC_SITE_URL}/confirm`,
      data: {
        username: username.trim()   // <-- USERNAME SAVED HERE
      }
    }
  })

  if (error || !data.user) {
    return { error: error?.message || "Signup failed." }
  }

  // 2️⃣ DO NOT INSERT INTO PROFILES
  // The trigger InsertProfileOnSignup already creates:
  // id, username, xp_total, level, lives, etc.

  return { success: true }
})
