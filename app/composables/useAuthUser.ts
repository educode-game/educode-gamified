// /app/composables/useAuthUser.ts
import { ref, onMounted, onUnmounted } from 'vue'
import type { User } from '@supabase/supabase-js'
import { useSupabase } from './useSupabase'

export const useAuthUser = () => {
  const supabase = useSupabase()
  const user = useState<User | null>('auth_user', () => null)
  const profile = useState<any | null>('auth_profile', () => null)
  const loading = ref(false)

  const fetchSession = async () => {
    loading.value = true
    try {
      const { data } = await supabase.auth.getSession()
      user.value = (data?.session?.user ?? null) as User | null
      return data?.session ?? null
    } finally {
      loading.value = false
    }
  }

  const fetchProfile = async () => {
    try {
      const session = (await supabase.auth.getSession())?.data?.session
      if (!session?.access_token) {
        profile.value = null
        return null
      }
      const res = await $fetch('/api/auth/profile', {
        headers: { Authorization: `Bearer ${session.access_token}` }
      }) as any
      profile.value = res?.profile ?? null
      return profile.value
    } catch (e) {
      profile.value = null
      return null
    }
  }

  const fetchUser = async () => {
    await fetchSession()
    await fetchProfile()
  }

  let sub: any = null
  const onFocus = () => {
    fetchProfile().catch(() => {})
  }

  onMounted(() => {
    // initial
    fetchUser().catch(() => {})

    try {
      const subscription = supabase.auth.onAuthStateChange((event, session) => {
        user.value = (session?.user ?? null) as User | null
        if (session?.access_token) {
          fetchProfile().catch(() => {})
        } else {
          profile.value = null
        }
      })
      sub = subscription.data?.subscription ?? subscription
    } catch (e) {
      // ignore
    }

    window.addEventListener('focus', onFocus)
    const interval = setInterval(() => fetchProfile().catch(() => {}), 30_000)

    onUnmounted(() => {
      try {
        if (sub?.unsubscribe) sub.unsubscribe()
        else if (typeof sub === 'function') sub()
      } catch {}
      window.removeEventListener('focus', onFocus)
      clearInterval(interval)
    })
  })

  return { user, profile, loading, fetchSession, fetchProfile, fetchUser }
}
