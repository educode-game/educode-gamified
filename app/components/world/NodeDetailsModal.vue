<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal">
      <h2>{{ node?.title }}</h2>
      <p><strong>Difficulty:</strong> {{ node?.difficulty }}</p>

      <div class="actions">
        <button @click="$emit('close')">Close</button>
        <button @click="$emit('open-challenge', node)">Start</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  show: boolean
  node: any
}>()

const emit = defineEmits(['close', 'open-challenge'])
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0;
  display:flex; justify-content:center; align-items:center;
  background: rgba(0,0,0,0.6);
  z-index:999;
}
.modal {
  background:#0f172a; padding:22px; border-radius:10px;
  width:300px; color:#fff; text-align:center;
}
.actions { display:flex; gap:12px; margin-top:18px; }
.actions button {
  flex:1; padding:10px; border-radius:8px;
  border:none; cursor:pointer; color:white;
}
.actions button:last-child { background:#14b8a6; }
.actions button:first-child { background:#475569; }
</style>
