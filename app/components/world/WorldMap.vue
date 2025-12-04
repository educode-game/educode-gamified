<template>
  <div class="world-map-root">
    <div class="map-wrap">
      <img :src="mapSrc" class="map-image" />

      <!-- Nodes -->
      <NodePoint
        v-for="node in nodesPct"
        :key="`${slug}-${node.id}`"
        :id="node.id"
        :leftPct="node.leftPct"
        :topPct="node.topPct"
        :locked="lockedSet.has(node.id)"
        :completed="completedSet.has(node.id)"
        @node-click="emitNodeClick(node.id)"
      />

      <!-- 🧪 TEMP DEBUG LABELS (remove later) -->
      <div
        v-for="node in nodesPct"
        :key="`label-${node.id}`"
        class="debug-label"
        :style="{ left: node.leftPct + '%', top: node.topPct + '%' }"
      >
        Node {{ node.id }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import NodePoint from "./NodePoint.vue"

interface RawNode {
  id: number | string
  x: number
  y: number
  slug?: string
  title?: string
  difficulty?: string
}

interface NodePercent {
  id: number
  leftPct: number
  topPct: number
}

const emit = defineEmits<{
  (e: "node-click", id: number): void
}>()

const props = defineProps<{
  slug: string
  nodes: RawNode[]
  progress?: { unlocked_nodes?: number[]; completed_nodes?: number[] } | null
  imgWidth?: number
  imgHeight?: number
}>()

/** Select correct map */
const mapSrc = computed(() => {
  const maps: Record<string, string> = {
    cpp: "/Cpp_Adventure_Map.jpg",
    "cpp-adventure": "/Cpp_Adventure_Map.jpg",
    python: "/Python_Adventure_Map.jpg",
    "python-adventure": "/Python_Adventure_Map.jpg",
    java: "/Java_Adventure_Map.jpg",
    "java-adventure": "/Java_Adventure_Map.jpg",
  }

  return maps[props.slug.toLowerCase()] ?? maps["cpp"]
})

/** Convert coords to percentage positioning */
const nodesPct = computed<NodePercent[]>(() =>
  props.nodes.map((node) => ({
    id: Number(node.id),
    leftPct: (Number(node.x) / (props.imgWidth ?? 730)) * 100,
    topPct: (Number(node.y) / (props.imgHeight ?? 560)) * 100,
  }))
)

/** Progress logic */
const lockedSet = computed(() => {
  const unlocks = new Set(props.progress?.unlocked_nodes ?? [])
  return new Set(props.nodes.filter(n => !unlocks.has(Number(n.id))).map(n => Number(n.id)))
})

const completedSet = computed(
  () => new Set(props.progress?.completed_nodes ?? [])
)

/** Emit click as number */
function emitNodeClick(id: number) {
  emit("node-click", id)
}
</script>

<style scoped>
.world-map-root {
  width: 100%;
  display: flex;
  justify-content: center;
}

.map-wrap {
  position: relative;
  width: 100%;
  max-width: 900px;
}

.map-image {
  width: 100%;
  pointer-events: none;
  border-radius: 12px;
}

/* 🧪 TEMP LABEL (delete later) */
.debug-label {
  position: absolute;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  z-index: 20;
}
</style>
