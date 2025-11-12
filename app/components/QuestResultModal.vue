<template>
  <v-dialog v-model="open" persistent max-width="500">
    <v-card>
      <v-card-title class="headline">Quest Result</v-card-title>
      <v-card-text>
        <div><strong>Stars:</strong> {{ stars }}</div>
        <div><strong>XP Earned:</strong> {{ xp }}</div>
        <div v-if="level_up"><strong>Level Up!</strong> Diamonds awarded: {{ diamonds }}</div>
      </v-card-text>
      <v-card-actions>
        <v-btn class="btn-primary" @click="close">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
const props = defineProps({ open: Boolean, stars: Number, xp: Number, level_up: Boolean, diamonds: Number })
const emit = defineEmits(['update:open'])
const close = () => emit('update:open', false)
</script>
