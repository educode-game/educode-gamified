// app/utils/authFetch.ts
import { useSupabase } from '~/composables/useSupabase'

/**
 * authFetch automatically attaches the Supabase Bearer token.
 * Works for all protected server API routes.
 */
export async function authFetch<T = any>(
  url: string,
  opts: any = {}
): Promise<T> {
  const supabase = useSupabase()

  const session = (await supabase.auth.getSession())?.data?.session
  const token = session?.access_token

  const headers = {
    ...(opts.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }

  return await $fetch<T>(url, {
    ...opts,
    headers
  })
}
