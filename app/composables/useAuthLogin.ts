import { ref } from "vue"
import { useSupabase } from "./useSupabase"
import { useAuthUser } from "./useAuthUser"

export const useAuthLogin = () => {
  const supabase = useSupabase()
  const { fetchUser } = useAuthUser()
  const loading = ref(false)
  const error = ref<string | null>(null)

  const login = async (email: string, password: string) => {
    loading.value = true
    error.value = null
    try {
      const { error: err } = await supabase.auth.signInWithPassword({
        email, password
      })
      if (err) throw err

      await fetchUser()
    } catch (e: any) {
      error.value = e.message ?? "Login failed"
    } finally {
      loading.value = false
    }
  }

  return { login, loading, error }
}
