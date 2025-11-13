// /server/utils/supabaseServerClient.ts
import { createClient, SupabaseClient, User } from '@supabase/supabase-js'

export const createServiceSupabase = (): SupabaseClient => {
  const config = useRuntimeConfig()
  return createClient(
    String(config.supabaseUrl || process.env.SUPABASE_URL || ''),
    String(config.supabaseServiceKey || process.env.SUPABASE_SERVICE_KEY || '')
  )
}

export const getUserFromToken = async (access_token: string): Promise<User | null> => {
  if (!access_token) return null
  const client = createServiceSupabase()
  const { data, error } = await client.auth.getUser(access_token)
  if (error || !data?.user) return null
  return data.user
}
