<template>
  <v-dialog v-model="internalOpen" persistent max-width="500">
    <v-card>
      <v-card-title class="headline">Quest Result</v-card-title>

      <v-card-text>
        <div><strong>Stars:</strong> {{ stars }}</div>
        <div><strong>XP Earned:</strong> {{ xp }}</div>
        <div v-if="level_up">
          <strong>Level Up!</strong> Diamonds awarded: {{ diamonds }}
        </div>
      </v-card-text>

      <v-card-actions>
        <v-btn class="btn-primary" @click="close">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed } from "vue"

const props = defineProps({
  open: { type: Boolean, required: true },
  stars: { type: Number, default: 0 },
  xp: { type: Number, default: 0 },
  level_up: { type: Boolean, default: false },
  diamonds: { type: Number, default: 0 }
})

const emit = defineEmits<{
  (e: "update:open", val: boolean): void
}>()

/** Proxy for v-model */
const internalOpen = computed({
  get: () => props.open,
  set: (val: boolean) => emit("update:open", val)
})

function close() {
  emit("update:open", false)
}
</script>

<style scoped>
</style>


