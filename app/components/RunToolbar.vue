<template>
  <div class="toolbar">

    <!-- LANGUAGE DROPDOWN (hidden in game mode) -->
    <div v-if="!disableLang" class="lang-container">
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

<script setup lang="ts">
import { ref, watch } from "vue"

const props = defineProps({
  modelValue: { type: String, default: "python" },
  running: Boolean,
  disableLang: { type: Boolean, default: false }   // 🔥 IMPORTANT
})

const emit = defineEmits(["update:language", "run", "save"])

// local state
const languageLocal = ref(props.modelValue)

// watch local dropdown → emit upward ONLY if lang is enabled
watch(languageLocal, (v) => {
  if (!props.disableLang) emit("update:language", v)
})

// if parent changes language → sync the dropdown
watch(
  () => props.modelValue,
  (v) => {
    if (v !== languageLocal.value) {
      languageLocal.value = v
    }
  }
)
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
</style>
