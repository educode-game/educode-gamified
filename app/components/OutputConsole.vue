<template>
  <div class="card" style="min-height:120px; background:#05050a; padding:12px;">
    <pre style="white-space:pre-wrap; font-family:monospace; margin:0;">{{ text }}</pre>
  </div>
</template>

<script setup>
const props = defineProps({ text: { type: String, default: '' } })
</script>

<style scoped>
</style>
