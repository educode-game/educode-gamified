// /server/api/auth/login.post.ts
import { supabaseServer } from '../../utils/supabaseServerClient'
import { readBody } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { identifier, password } = body

  if (!identifier || !password) {
    return { error: "Email/Username and password required." }
  }

  const client = supabaseServer


  let emailToUse = identifier

  // If username is used, convert to email
  if (!identifier.includes("@")) {
    const { data: userByUsername } = await client
      .from("profiles")
      .select("email")
      .eq("username", identifier)
      .single()

    if (!userByUsername) {
      return { error: "Invalid username or password." }
    }

    emailToUse = userByUsername.email
  }

  const { error } = await client.auth.signInWithPassword({
    email: emailToUse,
    password
  })

  if (error) return { error: error.message }

  return { success: true }
})
