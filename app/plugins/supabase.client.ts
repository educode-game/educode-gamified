// /app/plugins/supabase.client.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const supabase: SupabaseClient = createClient(
    config.public.supabaseUrl as string,
    config.public.supabaseAnonKey as string,
    {
      auth: { persistSession: true, detectSessionInUrl: true }
    }
  )

  nuxtApp.provide('supabase', supabase)
})
