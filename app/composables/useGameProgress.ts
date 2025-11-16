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

  const fetchProfile = async (): Promise<void> => {
    loading.value = true
    try {
      const { data } = await axios.get('/api/auth/profile')
      profile.value = data.profile ?? null
    } finally {
      loading.value = false
    }
  }

  const addXp = async (xp: number) => {
    if (xp <= 0) return

    loading.value = true
    try {
      const { data } = await axios.post('/api/auth/update-xp', {
        xp_gain: xp
      })
      
      // update local profile
      profile.value = data.profile
    } finally {
      loading.value = false
    }
  }

  return { profile, fetchProfile, addXp, loading }
}
