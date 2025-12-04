// app/composables/useWorlds.ts
import { ref } from "vue"
import { useApi } from "./useApi"

function normalizeFrontendWorld(raw: string) {
  let s = String(raw ?? "").toLowerCase().trim()
  s = s.replace(/\s+/g, "-")
  s = s.replace("c++", "cpp")
  if (!s) return ""
  return s
}

export const useWorlds = () => {
  const { apiFetch } = useApi()
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchInfo = async (worldRaw: string) => {
    loading.value = true
    error.value = null
    try {
      const world = normalizeFrontendWorld(worldRaw)
      const res = await apiFetch("/api/worlds/info", { query: { world } })
      return res?.world ?? null
    } catch (e: any) {
      error.value = e?.message || "Failed to load world"
      return null
    } finally {
      loading.value = false
    }
  }

  return { fetchInfo, loading, error }
}
