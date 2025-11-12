import { ref } from 'vue'
import { useAuthUser } from './useAuthUser'
import { useSupabase } from './useSupabase'   // ✅ add this line

export const useAuthLogin = () => {
  const supabase = useSupabase()
  const { fetchUser } = useAuthUser()
  const loading = ref(false)
  const error = ref<string | null>(null)

  const login = async (email: string, password: string): Promise<void> => {
    loading.value = true
    error.value = null
    try {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password })
      if (err) throw err
      await fetchUser()
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : String(e)
    } finally {
      loading.value = false
    }
  }

  return { login, loading, error }
}
