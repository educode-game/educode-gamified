import { ref } from "vue"

export const useWorldProgress = () => {
  const progress = ref<any>(null)

  const fetchProgress = async (world: string) => {
    const res = await $fetch("/api/worlds/progress", {
      params: { world }
    })
    progress.value = res
  }

  return { progress, fetchProgress }
}
