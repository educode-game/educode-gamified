<template>
  <v-app>
    <v-container class="auth-container d-flex align-center justify-center">
      <v-card class="auth-card" elevation="10">
               <!-- Logo -->
                     <img
                        src="/logo.png"
                        alt="EduCode Logo"
                        class="signup-logo"
                        @click="navigateToLanding" 
                    />
        <v-card-title class="text-center text-h5 mb-4">Welcome back to EduCode</v-card-title>

        <v-form @submit.prevent="handleLogin" class="d-flex flex-column gap-4">
          <v-text-field
            v-model="email"
            label="Email"
            type="email"
            variant="outlined"
            required
          />
          <v-text-field
            v-model="password"
            label="Password"
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
            Login
          </v-btn>

          <v-alert
            v-if="error"
            type="error"
            variant="tonal"
            class="mt-3 text-center"
          >
            {{ error }}
          </v-alert>

          <p class="text-center mt-4">
            Don’t have an account yet?
            <NuxtLink to="/signup" class="text-secondary font-weight-bold">Sign up here</NuxtLink>
          </p>
        </v-form>
      </v-card>
    </v-container>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from '#app'
import { useAuthLogin } from '@/composables/useAuthLogin'

const router = useRouter()
const email = ref('')
const password = ref('')
const { login, loading, error } = useAuthLogin()
const navigateToLanding = () => router.push('/landing')

const handleLogin = async () => {
  if (!email.value || !password.value) return
  await login(email.value, password.value)
  if (!error.value) {
    router.push('/') // redirect to dashboard
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
.signup-logo {
  width:350px;
  margin-bottom: 20px;
  cursor: pointer;
  filter: drop-shadow(0 0 20px rgba(0, 229, 255, 0.6));
  transition: transform 0.3s ease;
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
