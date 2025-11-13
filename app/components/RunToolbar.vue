<template>
  <div class="toolbar">

    <div class="lang-container">

      <select v-model="languageLocal" class="lang-select">
        <option value="python">Python</option>
        <option value="cpp">C++</option>
        <option value="java">Java</option>
      </select>
    </div>

    <button class="btn-run" :disabled="running" @click="$emit('run')">
      <span v-if="!running">▶ Run</span>
      <span v-else>⏳ Running…</span>
    </button>

    <button class="btn-save" @click="$emit('save')">
      SAVE
    </button>

  </div>
</template>

<script setup>
import { ref, watch } from "vue"

const props = defineProps({
  modelValue: String,
  running: Boolean
})

const emit = defineEmits(["update:language", "run", "save"])

const languageLocal = ref(props.modelValue)

// sync upward
watch(languageLocal, (v) => emit("update:language", v))
</script>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  gap: 14px;
}

.lang-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.lang-label {
  font-size: 0.8rem;
  color: rgba(255,255,255,0.7);
  font-weight: 600;
}

.lang-select {
  background: rgba(20,20,35,0.85);
  border: 1px solid rgba(0,229,255,0.3);
  color: white;
  padding: 10px 12px;
  border-radius: 8px;
  outline: none;
  font-weight: 600;
  cursor: pointer;
}

.lang-select option {
  background: #0e0e1a;
  color: white;
}

.btn-run {
  background: linear-gradient(90deg, #9333ea, #00e5ff);
  color: white;
  border-radius: 10px;
  padding: 10px 16px;
  border: none;
  font-weight: 700;
  cursor: pointer;
}
.btn-run:disabled {
  opacity: 0.6;
}

.btn-save {
  background: transparent;
  border: 2px solid #00e5ff;
  color: #00e5ff;
  border-radius: 10px;
  padding: 10px 16px;
  font-weight: 700;
  cursor: pointer;
}
.btn-save:hover {
  background: rgba(0,229,255,0.15);
}
</style>
