<template>
  <div class="challenge-page">
    <Navbar />

    <v-container>

      <h2>{{ challenge?.title }}</h2>
      <p>{{ challenge?.description }}</p>

      <!-- Language selector -->
      <div class="row mb-4">
        <label>Language</label>
        <v-select
          v-model="selectedLanguage"
          :items="['python', 'cpp', 'java']"
          style="max-width:220px"
        />
      </div>

      <!-- Code editor -->
      <Editor
        v-model="code"
        :language="selectedLanguage"
        height="300px"
      />

      <!-- Run + Submit Buttons -->
      <div class="buttons mt-4">
        <v-btn color="primary" :loading="running" @click="runChallenge">
          Run Code
        </v-btn>

        <v-btn
          color="green"
          v-if="result?.stars >= 0"
          @click="completeChallenge"
        >
          Submit Challenge
        </v-btn>
      </div>

      <!-- Results -->
      <div v-if="result" class="result-box mt-4">
        <h3>Result</h3>
        <p>Output: {{ result.output }}</p>
        <p>Stars: {{ result.stars }}</p>
      </div>

      <!-- Reward -->
      <div v-if="reward" class="reward-box mt-4">
        <h3>Reward</h3>
        <p>XP Earned: {{ reward.xpEarned }}</p>
        <p>New Level: {{ reward.newLevel }}</p>
      </div>

    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useSupabase } from '~/composables/useSupabase'
import Editor from '@/components/Editor.vue'
import Navbar from '@/components/Navbar.vue'

const route = useRoute()
const supabase = useSupabase()

// Dynamic route params
const worldSlug = route.params.world as string
const challengeSlug = route.params.challenge as string

// Challenge state
const challenge = ref<any>(null)
const challengeId = ref<string>('')

// User code + language
const code = ref('')
const selectedLanguage = ref<'python' | 'cpp' | 'java'>('python')

// Execution/Results
const running = ref(false)
const result = ref<any>(null)
const reward = ref<any>(null)

// Fetch challenge from DB
const loadChallenge = async () => {
  const { data, error } = await supabase
    .from('challenges')
    .select('*')
    .eq('slug', challengeSlug)
    .single()

  if (data) {
    challenge.value = data
    challengeId.value = data.id
    selectedLanguage.value = data.language || 'python'
    code.value = data.starter_code || ''
  }
}

// Run challenge
const runChallenge = async () => {
  running.value = true
  result.value = null

  const response = await $fetch('/api/game/run-challenge', {
    method: 'POST',
    body: {
      challenge_id: challengeId.value,
      code: code.value,
      language: selectedLanguage.value
    }
  })

  result.value = response
  running.value = false
}

// Submit challenge
const completeChallenge = async () => {
  if (!result.value || result.value.stars == null) return

  const token = (await supabase.auth.getSession()).data.session?.access_token

  const res = await $fetch('/api/game/complete-challenge', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: {
      challenge_id: challengeId.value,
      stars: result.value.stars
    }
  })

  reward.value = res
}

// Load challenge on page load
onMounted(() => {
  loadChallenge()
})
</script>

<style scoped>
.challenge-page {
  padding-top: 20px;
}
.result-box,
.reward-box {
  padding: 15px;
  border-radius: 10px;
  background: rgba(255,255,255,0.08);
}
.buttons {
  display: flex;
  gap: 15px;
}
</style>
