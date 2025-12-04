import { ref } from "vue"
import { useSupabase } from "./useSupabase"

export const useAuthSignup = () => {
  const supabase = useSupabase()
  const loading = ref(false)
  const error = ref<string | null>(null)
  const message = ref<string | null>(null)

  const signup = async (email: string, password: string) => {
    loading.value = true
    error.value = null
    message.value = null

    try {
      const redirectTo = useRuntimeConfig().public.baseUrl + "/confirm"
      const { error: err } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: redirectTo }
      })
      if (err) throw err

      message.value = "A confirmation email has been sent."
    } catch (e: any) {
      error.value = e.message ?? "Signup failed"
    } finally {
      loading.value = false
    }
  }

  return { signup, loading, error, message }
}
