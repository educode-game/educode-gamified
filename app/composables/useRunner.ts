import { ref } from "vue"
import { useApi } from "./useApi"

export const useRunner = () => {
  const { apiFetch } = useApi()
  const output = ref<any>(null)
  const running = ref(false)
  const error = ref("")

  const run = async (language: string, code: string, input = "") => {
    running.value = true
    output.value = null
    error.value = ""

    try {
      const res = await apiFetch<any>("/api/run", {
        method: "POST",
        body: { language, code, input }
      })

      // ⬅️ Ensure output is always OBJECT, not raw string
      output.value = typeof res === "string" ? JSON.parse(res) : res

    } catch (e: any) {
      error.value = e.message || "Run failed"
    } finally {
      running.value = false
    }
  }

  return { output, running, run, error }
}
