<template>
  <div class="run-toolbar d-flex" style="gap:8px; align-items:center;">
    <v-select v-model="language" :items="languages" dense style="width:160px" hide-details />
    <v-btn class="btn-primary" @click="$emit('run')">▶ Run</v-btn>
    <v-btn outlined @click="$emit('save')">Save</v-btn>
    <div style="margin-left:auto">
      <v-chip>{{ language.toUpperCase() }}</v-chip>
    </div>
  </div>
</template>

<script setup>
const languages = ['python','cpp','java']
const language = ref('python')
defineProps({ modelValue: String })
defineEmits(['run','save'])
</script>

<style scoped>
.run-toolbar { padding:8px; }
</style>
