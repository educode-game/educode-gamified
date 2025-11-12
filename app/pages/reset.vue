<template>
  <v-app>
    <v-container class="auth-container d-flex align-center justify-center">
      <v-card class="auth-card" elevation="10">
        <v-card-title class="text-center text-h5 mb-4">
          Reset your password
        </v-card-title>

        <v-form @submit.prevent="handleReset" class="d-flex flex-column gap-4">
          <v-text-field
            v-model="email"
            label="Email"
            type="email"
            variant="outlined"
            required
          />

          <v-btn
            type="submit"
            class="btn-primary"
            :loading="loading"
            :disabled="loading"
          >
            Send Reset Link
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
            Remember your password?
            <NuxtLink to="/login" class="text-secondary font-weight-bold">
              Back to Login
            </NuxtLink>
          </p>
        </v-form>
      </v-card>
    </v-container>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSupabase } from '@/composables/useSupabase'

const email = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const message = ref<string | null>(null)

const supabase = useSupabase()

const handleReset = async () => {
  if (!email.value) return
  loading.value = true
  error.value = null
  message.value = null

  try {
    const redirectTo = useRuntimeConfig().public.baseUrl + '/reset-confirm'
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.value, {
      redirectTo,
    })
    if (err) throw err
    message.value = 'Password reset link sent. Check your email inbox.'
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
