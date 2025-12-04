<template>
  <div
    class="node-point"
    :class="{ locked, completed }"
    :style="{
      left: leftPct + '%',
      top: topPct + '%'
    }"
    @click="handleClick"
  />
</template>

<script setup lang="ts">
const props = defineProps<{
  id: number
  leftPct: number
  topPct: number
  locked: boolean
  completed: boolean
}>()

const emit = defineEmits<{
  (e: "node-click", id: number): void
}>()

function handleClick() {
  if (!props.locked) emit("node-click", props.id)
}
</script>

<style scoped>
.node-point {
  position: absolute;
  width: 40px;
  height: 40px;
  cursor: pointer;
  border-radius: 50%;
  background: url("/node.png") no-repeat center;
  background-size: contain;
  transition: transform 0.2s ease;
}

.node-point:hover:not(.locked) {
  transform: scale(1.15);
}

.node-point.locked {
  filter: grayscale(1);
  opacity: 0.4;
  cursor: not-allowed;
}

.node-point.completed {
  box-shadow: 0 0 12px #00ffae;
}
</style>
