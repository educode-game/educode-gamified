// /app/composables/useGameSync.ts
import { useLives } from "./useLives"
import { useStats } from "./useStats"
import { useAuthUser } from "./useAuthUser"

export const useGameSync = () => {
  const { fetchLives } = useLives()
  const { fetchStats } = useStats()
  const { fetchProfile } = useAuthUser()

  /**
   * Call AFTER quest submit or any XP/life event
   * to update UI globally.
   */
  const syncAll = async () => {
    await Promise.all([
      fetchLives().catch(() => {}),
      fetchStats().catch(() => {}),
      fetchProfile().catch(() => {}),
    ])
  }

  return { syncAll }
}
