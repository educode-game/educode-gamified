// /server/api/auth/login.post.ts
import { defineEventHandler, readBody } from 'h3'
import { createServiceSupabase } from '../../utils/supabaseServerClient'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { identifier, password } = body

  if (!identifier || !password) {
    return { error: "Email/Username and password required." }
  }

  const client = createServiceSupabase()
  let emailToUse = identifier

  // If user enters a USERNAME, convert it to email
  if (!identifier.includes("@")) {
    const { data: userByUsername } = await client
      .from("profiles")
      .select("email")
      .eq("username", identifier)
      .single()

    if (!userByUsername?.email) {
      return { error: "Invalid username or password." }
    }

    emailToUse = userByUsername.email
  }

  const { error } = await client.auth.signInWithPassword({
    email: emailToUse,
    password
  })

  if (error) return { error: error.message }

  // Note: server signing in with service key DOES NOT set client session.
  // We keep this endpoint for compatibility but the final client auth is done client-side.
  return { success: true }
})
