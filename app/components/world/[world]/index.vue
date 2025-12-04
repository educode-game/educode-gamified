<template>
  <div class="page-world">
    <Navbar />

    <div class="page-header">
      <h1>{{ prettyName }}</h1>
      <div class="actions">
        <button @click="reloadMap">Refresh</button>
      </div>
    </div>

    <WorldMap
      :slug="worldCode"
      :nodes="nodes"
      :progress="progress"
      :imgWidth="730"
      :imgHeight="560"
      @node-click="handleNodeClick"
    />

    <!-- Node preview panel -->
    <div v-if="activeNode" class="node-panel">
      <h3>{{ activeNode.title }}</h3>
      <p>Difficulty: {{ activeNode.difficulty || '—' }}</p>
      <div class="controls">
        <button @click="goToNode(activeNode)">Open</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { useRoute, useRouter } from "#imports"
import Navbar from "~/components/Navbar.vue"
import WorldMap from "~/components/world/WorldMap.vue"

import { useApi } from "~/composables/useApi"
import { useWorldMap } from "~/composables/useWorldMap"
import { useWorlds } from "~/composables/useWorlds"

const route = useRoute()
const router = useRouter()
const { apiFetch } = useApi()
const { fetchNodes } = useWorldMap()
const { fetchInfo } = useWorlds()

/** RAW slug (example: cpp-adventure) */
const worldCode = String(route.params.world ?? "").toLowerCase()

/** PRETTY NAME */
const prettyName = computed(() => {
  if (worldCode.includes("cpp")) return "C++ Adventure"
  if (worldCode.includes("python")) return "Python Adventure"
  if (worldCode.includes("java")) return "Java Adventure"
  return worldCode.toUpperCase()
})

/** STATE */
const nodes = ref<any[]>([])
const progress = ref<{ completed_nodes: number[]; unlocked_nodes: number[] }>({
  completed_nodes: [],
  unlocked_nodes: [1]
})
const worldInfo = ref<any>(null)
const activeNode = ref<any>(null)

/** ACTIONS */
function handleNodeClick(nodeId: number) {
  activeNode.value =
    nodes.value.find((n) => Number(n.id) === Number(nodeId)) ??
    { id: nodeId, title: `Node ${nodeId}` }
}

function goToNode(node: any) {
  const slug = node.slug ?? node.id
  router.push(`/worlds/${worldCode}/${encodeURIComponent(String(slug))}`)
}

function reloadMap() {
  loadWorld()
}

/** LOAD WORLD (map + nodes + progress) */
async function loadWorld() {
  try {
    // 1. world info (title, description, etc.)
    worldInfo.value = await fetchInfo(worldCode)

    // 2. nodes list
    nodes.value = await fetchNodes(worldCode)

    // 3. MAP endpoint provides progress! (correct new hybrid logic)
    const mapRes = await apiFetch<any>(`/api/worlds/${worldCode}/map`)

    if (mapRes?.progress) {
      progress.value = {
        completed_nodes: mapRes.progress.completed_nodes ?? [],
        unlocked_nodes: mapRes.progress.unlocked_nodes ?? [1]
      }
    }
  } catch (err) {
    console.error("Failed to load world:", err)
  }
}

onMounted(() => loadWorld())
</script>

<style scoped>
.page-world {
  padding: 84px 18px 18px;
  min-height: 100vh;
  background: linear-gradient(135deg, #5e17eb 0%, #0f6af5 45%, #07d6ff 100%);
  color: #e6f0ff;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.page-header h1 {
  margin: 0;
  font-size: 1.6rem;
}

.actions button {
  padding: 8px 10px;
  border-radius: 8px;
  background: #0b1723;
  color: #cfe8ff;
  border: 1px solid rgba(255, 255, 255, 0.03);
  cursor: pointer;
}

.node-panel {
  position: fixed;
  right: 18px;
  bottom: 18px;
  width: 260px;
  background: rgba(8, 12, 20, 0.9);
  border-radius: 10px;
  padding: 14px;
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.node-panel h3 {
  margin: 0 0 6px 0;
}

.node-panel .controls {
  margin-top: 12px;
  display: flex;
  gap: 8px;
}

.node-panel button {
  flex: 1;
  padding: 8px;
  border-radius: 8px;
  background: linear-gradient(90deg, #9333ea, #00e5ff);
  color: #fff;
  border: none;
  cursor: pointer;
}
</style>
