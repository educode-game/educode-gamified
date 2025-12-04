<template>
  <v-app>
    <Navbar />
    <v-container class="container">
      <div class="card">
        <h2>Settings</h2>

        <div style="margin-top:12px;">
          <h4>Account</h4>
          <div v-if="profile">
            <p><strong>Username:</strong> {{ profile.username }}</p>
            <p><strong>Email:</strong> {{ profile.email }}</p>
          </div>

          <div style="margin-top:12px;">
            <button @click="signOut">Sign Out</button>
          </div>
        </div>
      </div>
    </v-container>
  </v-app>
</template>

<script setup lang="ts">
import Navbar from '~/components/Navbar.vue'
import { useAuthUser } from '~/composables/useAuthUser'
import { useSupabase } from '~/composables/useSupabase'
import { useRouter } from '#app'

const { profile } = useAuthUser()
const supabase = useSupabase()
const router = useRouter()

const signOut = async () => {
  await supabase.auth.signOut()
  router.push('/index')
}
</script>

<style scoped>
/* minimal styling - uses existing app card styles */
</style>
