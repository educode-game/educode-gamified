<template>
  <div class="map-page">
    <img :src="mapImage" class="map-background" />

    <!-- TITLE -->
    <div class="map-title">
      {{ worldName }}
    </div>

    <!-- CHALLENGE DOTS -->
    <div
      v-for="point in points"
      :key="point.id"
      class="challenge-node"
      :style="{ top: point.y + 'px', left: point.x + 'px' }"
      @click="openChallenge(point.id)"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from '#app'
import { ref, computed } from 'vue'

const route = useRoute()
const router = useRouter()

// Accepted slugs
const slug = route.params.world as string

// Map image selection
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

// Display readable title
const worldName = computed(() => {
  switch (slug) {
    case 'namespace-necropolis': return 'Namespace Necropolis'
    case 'snakebyte-sanctum': return 'Snakebyte Sanctum'
    case 'classpath-crypt': return 'Classpath Crypt'
    default: return 'Unknown World'
  }
})

// Challenge node placeholders (you can adjust later)
// These positions are arbitrary — replace later with real coordinates.
const points = ref([
  { id: 1, x: 200, y: 300 },
  { id: 2, x: 350, y: 500 },
  { id: 3, x: 600, y: 450 },
  { id: 4, x: 800, y: 300 }
])

// When clicking a node
const openChallenge = (challengeId: number) => {
  router.push(`/worlds/${slug}/${challengeId}`)
}
</script>

<style scoped>
.map-page {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

/* Background map */
.map-background {
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}

/* Map title */
.map-title {
  position: absolute;
  top: 30px;
  width: 100%;
  text-align: center;
  font-size: 38px;
  font-weight: bold;
  color: #fff;
  text-shadow: 0 4px 10px rgba(0,0,0,0.6);
}

/* Clickable challenge nodes */
.challenge-node {
  position: absolute;
  width: 28px;
  height: 28px;
  background: yellow;
  border-radius: 50%;
  border: 3px solid #fff;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(255,255,0,0.8);
  transition: transform 0.2s ease;
}

.challenge-node:hover {
  transform: scale(1.3);
}
</style>
