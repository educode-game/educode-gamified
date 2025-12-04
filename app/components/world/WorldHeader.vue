<template>
  <div class="header">
    <h1>{{ title }}</h1>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
defineProps<{ title: string }>()
</script>

<style scoped>
.header { display:flex; justify-content:space-between; align-items:center; padding:12px 0; color:#e2e8f0; }
.header h1 { margin:0; font-size:1.8rem; }
</style>
