<template>
  <div class="output-card">
    <div class="output-head">
      <strong>Output</strong>
      <div class="meta">
        <span v-if="error" class="err">Error</span>
      </div>
    </div>
    <div class="output-body">
      <pre v-if="text">{{ text }}</pre>
      <pre v-else class="muted">No output. Click Run to execute your code.</pre>
      <pre v-if="error" class="err-block">{{ error }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  text: { type: String, default: '' },
  error: { type: String, default: '' }
})
</script>

<style scoped>
.output-card {
  margin-top: 8px;
  background: rgba(0,0,0,0.68);
  border-radius: 10px;
  padding: 12px;
  border: 1px solid rgba(255,255,255,0.03);
}
.output-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; }
.meta .err { color: #ff8a8a; font-weight:700; }
.output-body pre { font-family: monospace; white-space: pre-wrap; margin:0; color: #dbe9ff; }
.muted { color: rgba(255,255,255,0.45); }
.err-block { color: #ff9b9b; margin-top:8px; }
</style>
