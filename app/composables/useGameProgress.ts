// /app/composables/useGameProgress.ts
import axios from 'axios'
import { ref } from 'vue'

interface Profile {
  id: string
  username: string
  xp_total: number
  level: number
  lives: number
  diamonds: number
  hints: number
}

export const useGameProgress = () => {
  const profile = ref<Profile | null>(null)
  const loading = ref(false)

  const fetchProfile = async (token?: string): Promise<void> => {
    loading.value = true
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const { data } = await axios.get('/api/auth/profile', { headers })
      profile.value = data.profile ?? null
    } finally {
      loading.value = false
    }
  }

  return { profile, fetchProfile, loading }
}
