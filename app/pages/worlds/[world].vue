<template>
  <v-app>
    <Navbar />

    <div class="map-page">
      <h1 class="map-title">{{ prettyWorld }}</h1>

      <WorldMap
        :slug="worldSlug"
        :nodes="nodes"
        :progress="progress"
        @node-click="goToNode"
      />
    </div>
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue"
import { useRoute, useRouter } from "#imports"
import Navbar from "@/components/Navbar.vue"
import WorldMap from "@/components/world/WorldMap.vue"
import { useWorlds } from "@/composables/useWorlds"
import { useWorldMap } from "@/composables/useWorldMap"

const route = useRoute()
const router = useRouter()

const normalize = (s: string) =>
  s.toLowerCase().replace("-adventure", "").replace("c++", "cpp")

const worldSlug = normalize(String(route.params.world))

const { fetchInfo } = useWorlds()
const { fetchNodes } = useWorldMap()

const nodes = ref<any[]>([])
const progress = ref({
  completed_nodes: [],
  unlocked_nodes: [1]
})

// function goToNode(id: number) {
//   if (!id || isNaN(Number(id))) {
//     console.warn("Invalid node ID:", id)
//     return
//   }
//   router.push(`/quest/${worldSlug}/${id}`)
// }

function goToNode(id: number) {
  if (!id || Number.isNaN(id)) {
    console.warn("⚠️ Tried navigating with invalid id:", id)
    return
  }

  router.push(`/quest/${worldSlug}/${id}`)
}


const prettyWorld = computed(() =>
  worldSlug.replace(/\b\w/g, (l) => l.toUpperCase())
)

onMounted(async () => {
  await fetchInfo(worldSlug)
  nodes.value = await fetchNodes(worldSlug)
})
</script>
