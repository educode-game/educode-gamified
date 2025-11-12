<template>
  <v-app>
    <v-main>
      <NuxtPage />
    </v-main>

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
import { useRoute, useRouter } from '#app'
import { useSupabase } from '@/composables/useSupabase'

const router = useRouter()
const route = useRoute()
const supabase = useSupabase()
const snackbar = ref(false)
const snackbarMessage = ref('')

/* 🔒 Check auth state globally */
supabase.auth.onAuthStateChange((event, session) => {
  if (!session && route.path === '/') {
    router.push('/landing')
  }
})

/* ✅ Fixed: Prevent symbol-to-string crash */
watch(route, () => {
  const routeName = typeof route.name === 'symbol' ? String(route.name) : route.name
  snackbarMessage.value = `Navigated to ${routeName || route.path}`
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
