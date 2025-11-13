// /app/composables/useAuthUser.ts
import { ref } from 'vue'
import type { User } from '@supabase/supabase-js'
import { useSupabase } from './useSupabase'

export const useAuthUser = () => {
  const user = useState<User | null>('auth_user', () => null)
  const loading = ref(false)
  const supabase = useSupabase()

  const fetchUser = async (): Promise<void> => {
    loading.value = true
    try {
      // getSession returns session -> user
      const { data } = await supabase.auth.getSession()
      user.value = data?.session?.user ?? null
    } finally {
      loading.value = false
    }
  }

  const signOut = async (): Promise<void> => {
    await supabase.auth.signOut()
    user.value = null
  }

  return { user, fetchUser, signOut, loading }
}
