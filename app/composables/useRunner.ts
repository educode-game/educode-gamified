// app/composables/useRunner.ts
import { ref } from "vue"
import { useApi } from "./useApi"

export const useRunner = () => {
  const { apiFetch } = useApi()

  const output = ref("")
  const running = ref(false)
  const error = ref("")

  const run = async (language: string, code: string, input = "") => {
    running.value = true
    output.value = ""
    error.value = ""

    try {
      const res = await apiFetch<{
        stdout?: string
        stderr?: string
        compile_output?: string
        status?: { id: number; description: string } | null
      }>("/api/run", {
        method: "POST",
        body: { language, code, input }
      })

      output.value =
        res.stdout ||
        res.compile_output ||
        res.stderr ||
        JSON.stringify(res)
    } catch (e: any) {
      error.value = e?.message || "Run failed"
    } finally {
      running.value = false
    }
  }

  return { output, running, error, run }
}
