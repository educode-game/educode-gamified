<template>
  <v-app>
    <v-container class="confirm-container d-flex align-center justify-center">
      <v-card class="confirm-card text-center" elevation="10">
        <v-progress-circular
          v-if="loading"
          indeterminate
          color="cyan lighten-3"
          size="60"
          width="6"
          class="mb-6"
        />
        <v-icon v-else color="success" size="60" class="mb-4">mdi-check-circle-outline</v-icon>

        <h2 class="text-h5 font-weight-bold mb-2">
          {{ loading ? 'Verifying your email...' : 'Email Confirmed!' }}
        </h2>
        <p v-if="!loading" class="text-body-2 mb-6">
          Your EduCode account is now active. Redirecting to login...
        </p>

        <v-btn
          v-if="!loading"
          class="btn-primary"
          @click="goLogin"
        >
          Go to Login
        </v-btn>
      </v-card>
    </v-container>
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from '#app'
import { useSupabase } from '@/composables/useSupabase'

const loading = ref(true)
const router = useRouter()
const supabase = useSupabase()

const goLogin = () => router.push('/login')

onMounted(async () => {
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) console.error(error)

    // Wait a few seconds for smooth UX
    setTimeout(() => {
      loading.value = false
      setTimeout(() => router.push('/login'), 3000)
    }, 2000)
  } catch (e) {
    console.error('Email confirmation error:', e)
    loading.value = false
  }
})
</script>

<style scoped>
.confirm-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #6b21a8, #00e5ff);
  padding: 24px;
}

.confirm-card {
  width: 100%;
  max-width: 420px;
  background: rgba(17, 15, 40, 0.95);
  color: #fff;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 10px 35px rgba(0, 0, 0, 0.4);
}

.btn-primary {
  background: linear-gradient(90deg, #6b21a8, #00e5ff);
  color: #fff;
  border-radius: 10px;
  font-weight: 600;
  text-transform: none;
}
</style>
