<template>
  <div class="map-page">
    <!-- MAP BACKGROUND -->
    <img :src="mapImage" class="map-background" />

    <!-- WORLD TITLE -->
    <div class="map-title">{{ worldName }}</div>

    <!-- 15 NODES -->
    <div
      v-for="node in nodes"
      :key="node.id"
      class="challenge-node"
      :class="{
        locked: !progress.unlocked_nodes.includes(node.id),
        completed: progress.completed_nodes.includes(node.id)
      }"
      :style="{ top: node.y + 'px', left: node.x + 'px' }"
      @click="openNode(node.id)"
    >
      <span>{{ node.id }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from '#app'
import { useSupabase } from '~/composables/useSupabase'

// 👇 Supabase client
const supabase = useSupabase()
const route = useRoute()
const router = useRouter()

const slug = route.params.world as string
const userId = ref<string | null>(null)

// FETCH USER SESSION
onMounted(async () => {
  const session = (await supabase.auth.getSession())?.data?.session
  userId.value = session?.user?.id ?? null

  if (userId.value) {
    await loadProgress()
  }
})

// DEFAULT PROGRESSION STATE
const progress = ref({
  completed_nodes: [] as number[],
  unlocked_nodes: [1] as number[]
})

// GET PROGRESS FROM API
const loadProgress = async () => {
  const res = await $fetch('/api/worlds/progress', {
    params: { world: slug }
  })
  progress.value = res || { completed_nodes: [], unlocked_nodes: [1] }
}

// STATIC NODE COORDINATES (15 nodes)
const nodes = [
  { id: 1, x: 200, y: 250 },
  { id: 2, x: 360, y: 330 },
  { id: 3, x: 520, y: 400 },
  { id: 4, x: 660, y: 320 },
  { id: 5, x: 820, y: 260 },
  { id: 6, x: 950, y: 360 },
  { id: 7, x: 1100, y: 440 },
  { id: 8, x: 950, y: 530 },
  { id: 9, x: 760, y: 580 },
  { id: 10, x: 560, y: 520 },
  { id: 11, x: 380, y: 450 },
  { id: 12, x: 240, y: 540 },
  { id: 13, x: 120, y: 470 },
  { id: 14, x: 260, y: 380 },
  { id: 15, x: 420, y: 300 }
]

// WORLD IMAGES
const mapImage = computed(() => {
  switch (slug) {
    case 'namespace-necropolis':
      return '/Dungeon-NameSpace.png'
    case 'snakebyte-sanctum':
      return '/Dungeon-SnakeSanctum.png'
    case 'classpath-crypt':
      return '/Dungeon-ClasspathCrypt.png'
    default:
      return '/Dungeon-NameSpace.png'
  }
})

// WORLD NAMES
const worldName = computed(() => {
  switch (slug) {
    case 'namespace-necropolis':
      return 'Namespace Necropolis'
    case 'snakebyte-sanctum':
      return 'Snakebyte Sanctum'
    case 'classpath-crypt':
      return 'Classpath Crypt'
    default:
      return 'Unknown World'
  }
})

// CLICK NODE
const openNode = (id: number) => {
  if (!progress.value.unlocked_nodes.includes(id)) return
  router.push(`/worlds/${slug}/${id}`)
}
</script>

<style scoped>
.map-page {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.map-background {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.map-title {
  position: absolute;
  top: 30px;
  width: 100%;
  text-align: center;
  font-size: 38px;
  font-weight: bold;
  color: white;
  text-shadow: 0 4px 10px rgba(0,0,0,0.6);
}

/* Node style */
.challenge-node {
  position: absolute;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: rgba(255,255,255,0.15);
  border: 3px solid white;
  display:flex;
  justify-content:center;
  align-items:center;
  cursor:pointer;
  transition: 0.25s ease;
  font-weight: bold;
  font-size: 16px;
  color: white;
}

/* COMPLETED NODE */
.challenge-node.completed {
  background: linear-gradient(90deg, #22c55e, #0ea5e9);
  box-shadow: 0 0 12px rgba(0,255,180,0.7);
}

/* LOCKED NODE */
.challenge-node.locked {
  background: rgba(255,255,255,0.15);
  border-color: rgba(255,255,255,0.25);
  opacity: 0.45;
  cursor: not-allowed;
}

/* Hover only if unlocked */
.challenge-node:not(.locked):hover {
  transform: scale(1.25);
}
</style>
