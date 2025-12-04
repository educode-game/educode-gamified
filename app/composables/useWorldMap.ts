// app/composables/useWorldMap.ts
import { ref } from "vue"
import { useApi } from "./useApi"

const fallbackNodes = [
  { id: 1, x: 630, y: 160 },
  { id: 2, x: 350, y: 250 },
  { id: 3, x: 120, y: 230 },
  { id: 4, x: -10, y: 70 },
  { id: 5, x: -230, y: 250 },
  { id: 6, x: 200, y: 165 },
  { id: 7, x: 95, y: 220 },
  { id: 8, x: 20, y: 260 },
  { id: 9, x: -45, y: 240 },
  { id: 10, x: -145, y: 300 },
  { id: 11, x: 620, y: 230 },
  { id: 12, x: -1, y: 60 },
  { id: 13, x: -120, y: 1 },
  { id: 14, x: -320, y: -60 },
  { id: 15, x: -390, y: 200 }
]

export const useWorldMap = () => {
  const { apiFetch } = useApi()
  const loading = ref(false)

  const normalizeNode = (node: any, index: number) => {
    const safeId = Number(node?.order_index ?? index + 1)

    const fallback = fallbackNodes[safeId - 1]  // 🧠 Correct mapping

    return {
      id: safeId,
      title: node?.title || `Node ${safeId}`,
      slug: node?.slug || `node_${safeId}`,
      
      x: Number((node?.x ?? 0) + (fallback?.x ?? 0)),
      y: Number((node?.y ?? 0) + (fallback?.y ?? 0)),

      difficulty: node?.difficulty || "easy",
      user_progress: node?.user_progress ?? null
    }
  }

  const fetchNodes = async (world_code: string) => {
    loading.value = true
    try {
      const res = await apiFetch<{ nodes: any[] }>(
        "/api/worlds/nodes",
        { query: { world_code } }
      )

      const raw = res?.nodes ?? []

      return raw.length > 0
        ? raw.map(normalizeNode)
        : fallbackNodes.map(normalizeNode)
    } finally {
      loading.value = false
    }
  }

  return { fetchNodes, loading }
}
