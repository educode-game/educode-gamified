<template>
  <v-app>
    <v-main>
      <NuxtPage />
    </v-main>

    <!-- Snackbar -->
    <v-snackbar
      v-model="snackbar"
      color="deep-purple-accent-2"
      timeout="2500"
      class="text-center"
    >
      {{ snackbarMessage }}
    </v-snackbar>
  </v-app>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter, useRoute } from '#app'
import { useSupabase } from '@/composables/useSupabase'

const router = useRouter()
const route = useRoute()
const supabase = useSupabase()

// Snackbar
const snackbar = ref(false)
const snackbarMessage = ref('')

// --- FIXED AUTH LISTENER ---
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    router.push('/index')
  }

  if (event === 'SIGNED_IN') {
    router.push('/dashboard')
  }
})

// --- FIXED SNACKBAR WATCH ---
watch(route, () => {
  snackbarMessage.value = `Navigated to ${route.path}`
  snackbar.value = true
})
</script>

<style>
html,
body {
  background: linear-gradient(135deg, #6b21a8, #00e5ff);
  min-height: 100vh;
  color: #fff;
  margin: 0;
  font-family: "Poppins", sans-serif;
}

.v-application {
  background: transparent !important;
}
</style>
