import { ref } from 'vue'
import { useSupabase } from './useSupabase'   // ✅ added

export const useAuthSignup = () => {
  const supabase = useSupabase()
  const loading = ref(false)
  const error = ref<string | null>(null)
  const message = ref<string | null>(null)

  const signup = async (email: string, password: string): Promise<void> => {
    loading.value = true
    error.value = null
    message.value = null
    try {
      const redirectTo = useRuntimeConfig().public.baseUrl + '/confirm'
      const { error: err } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: redirectTo }
      })
      if (err) throw err
      message.value = 'Confirmation email sent. Check your inbox.'
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : String(e)
    } finally {
      loading.value = false
    }
  }

  return { signup, loading, error, message }
}
