<template>
  <v-app>
    <Navbar />
    <v-container class="container">
      <div class="card">
        <div style="display:flex; gap:16px; align-items:flex-start;">
          <div style="flex:1">
            <h3>{{ challenge?.title }}</h3>
            <div style="color:var(--muted)">{{ challenge?.description }}</div>
            <div style="margin-top:12px">
              <RunToolbar v-model:language="language" @run="onRun" @save="onSave" />
              <Editor v-model="code" :language="language" height="50vh" />
              <div style="margin-top:12px">
                <v-btn class="btn-primary" @click="onSubmit">Submit</v-btn>
                <OutputConsole :text="output" />
              </div>
            </div>
          </div>
          <div style="width:320px">
            <div class="card" style="padding:12px;">
              <h4>Hints</h4>
              <div v-for="n in (challenge?.hints_available||0)" :key="n" style="margin-top:8px">
                <v-btn small @click="buyHint(n)">Buy Hint {{ n }} (1 ♦)</v-btn>
              </div>
            </div>
            <div style="margin-top:12px" class="card">
              <h4>Info</h4>
              <div>XP Base: {{ challenge?.xp_base }}</div>
              <div>Difficulty: {{ challenge?.difficulty }}</div>
            </div>
          </div>
        </div>
      </div>
      <QuestResultModal v-model:open="resultOpen" :stars="lastResult.stars" :xp="lastResult.xp" :level_up="lastResult.level_up" :diamonds="lastResult.diamonds_awarded"/>
    </v-container>
  </v-app>
</template>

<script setup>
import Navbar from '@/components/Navbar.vue'
import Editor from '@/components/Editor.vue'
import RunToolbar from '@/components/RunToolbar.vue'
import OutputConsole from '@/components/OutputConsole.vue'
import QuestResultModal from '@/components/QuestResultModal.vue'
import axios from 'axios'
import { ref, onMounted } from 'vue'

const route = useRoute()
const id = route.params.id
const challenge = ref(null)
const code = ref('')
const language = ref('python')
const output = ref('')
const resultOpen = ref(false)
const lastResult = ref({ stars:0, xp:0, level_up:false, diamonds_awarded:0 })

onMounted(async () => {
  const { data } = await axios.get(`/api/challenges/get?id=${id}`)
  challenge.value = data.challenge
  language.value = challenge.value.language
  code.value = challenge.value.starter_code || ''
})

const onRun = async () => {
  const { data } = await axios.post('/api/run', { language: language.value, code: code.value })
  output.value = data?.run?.output ?? data?.output ?? JSON.stringify(data)
}

const onSave = async () => {
  const token = (await useSupabase().auth.getSession())?.data?.session?.access_token
  await useSnippets().save(challenge.value.title + ' - draft', language.value, code.value, token)
  alert('Saved')
}

const onSubmit = async () => {
  const token = (await useSupabase().auth.getSession())?.data?.session?.access_token
  const headers = token ? { Authorization: `Bearer ${token}` } : {}
  const runResp = await axios.post('/api/run', { language: language.value, code: code.value })
  const out = runResp.data?.run?.output ?? runResp.data?.output ?? JSON.stringify(runResp.data)
  const submitResp = await axios.post('/api/challenges/submit', { challenge_id: id, output: out }, { headers })
  lastResult.value = submitResp.data
  resultOpen.value = true
}
const buyHint = async (n) => {
  const token = (await useSupabase().auth.getSession())?.data?.session?.access_token
  const headers = token ? { Authorization: `Bearer ${token}` } : {}
  const { data } = await axios.post('/api/challenges/hint', { challenge_id: id, hint_number: n }, { headers })
  alert('Hint: ' + data.hint)
}
</script>
