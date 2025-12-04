// app/composables/useApi.ts
import { useSupabase } from "./useSupabase"

export const useApi = () => {
  const supabase = useSupabase()

  // Get auth header
  const getHeaders = async () => {
    const session = await supabase.auth.getSession()
    const token = session?.data?.session?.access_token
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  // Typed wrapper for $fetch()
  const apiFetch = async <T = any>(url: string, opts: any = {}) => {
    const authHeaders = await getHeaders()
    return $fetch<T>(url, {
      ...opts,
      headers: { ...(opts.headers || {}), ...authHeaders }
    })
  }

  return { apiFetch }
}
