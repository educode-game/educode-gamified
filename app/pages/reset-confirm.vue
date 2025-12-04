<template>
  <v-app>
    <v-container class="auth-container d-flex align-center justify-center">
      <v-card class="auth-card" elevation="10">
        <v-card-title class="text-center text-h5 mb-4">
          Set a New Password
        </v-card-title>

        <v-form @submit.prevent="handleConfirm" class="d-flex flex-column gap-4">
          <v-text-field
            v-model="password"
            label="New Password"
            type="password"
            variant="outlined"
            required
          />

          <v-btn
            type="submit"
            class="btn-primary"
            :loading="loading"
            :disabled="loading"
          >
            Update Password
          </v-btn>

          <v-alert
            v-if="message"
            type="success"
            variant="tonal"
            class="mt-3 text-center"
          >
            {{ message }}
          </v-alert>
          <v-alert
            v-if="error"
            type="error"
            variant="tonal"
            class="mt-3 text-center"
          >
            {{ error }}
          </v-alert>

          <p class="text-center mt-4">
            <NuxtLink to="/login" class="text-secondary font-weight-bold">
              Return to Login
            </NuxtLink>
          </p>
        </v-form>
      </v-card>
    </v-container>
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from '#app'
import { useSupabase } from '@/composables/useSupabase'

const router = useRouter()
const password = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const message = ref<string | null>(null)
const supabase = useSupabase()

onMounted(async () => {
  // Supabase uses URL hash params to identify reset flow
  await supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'PASSWORD_RECOVERY') {
      console.log('Password recovery flow detected.')
    }
  })
})

const handleConfirm = async () => {
  if (!password.value) return
  loading.value = true
  error.value = null
  message.value = null

  try {
    const { error: err } = await supabase.auth.updateUser({ password: password.value })
    if (err) throw err
    message.value = 'Password successfully updated. You can now log in.'
    setTimeout(() => router.push('/login'), 2500)
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #6b21a8, #00e5ff);
  padding: 24px;
}
.auth-card {
  width: 100%;
  max-width: 420px;
  background: rgba(17, 15, 40, 0.95);
  color: #fff;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 10px 35px rgba(0, 0, 0, 0.4);
}
.btn-primary {
  background: linear-gradient(90deg, #6b21a8, #00e5ff);
  color: #fff;
  border-radius: 10px;
  font-weight: 600;
  text-transform: none;
}
a {
  text-decoration: none;
}
</style>