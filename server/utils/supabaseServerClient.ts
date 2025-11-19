// /server/utils/supabaseServerClient.ts
import { createClient } from '@supabase/supabase-js'
import type { H3Event } from 'h3'

// Load env
const supabaseUrl = process.env.NUXT_SUPABASE_URL
const supabaseServiceRoleKey = process.env.NUXT_SUPABASE_SERVICE_KEY

if (!supabaseUrl) throw new Error("NUXT_SUPABASE_URL is required.")
if (!supabaseServiceRoleKey) throw new Error("NUXT_SUPABASE_SERVICE_KEY is required.")

// Global server client (service role)
export const supabaseServer = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: { persistSession: false }
  }
)

/**
 * Extract user from Authorization header (Bearer token)
 */
export async function getUserFromEvent(event: H3Event) {
  const authHeader = event.node.req.headers['authorization']
  if (!authHeader) return null

  const token = authHeader.replace('Bearer ', '')
  if (!token) return null

  const { data, error } = await supabaseServer.auth.getUser(token)
  if (error || !data?.user) return null

  return data.user
}
