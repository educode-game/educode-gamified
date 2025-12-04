import { ref } from "vue"
import { useApi } from "./useApi"

export const useStats = () => {
  const { apiFetch } = useApi()
  const profile = ref(null)
  const summary = ref(null)
  const progress = ref<any[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchStats = async () => {
    loading.value = true
    try {
      const res = await apiFetch<any>("/api/users/stats")
      profile.value = res.profile
      summary.value = res.summary
      progress.value = res.progress
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  return { fetchStats, profile, summary, progress, loading, error }
}
