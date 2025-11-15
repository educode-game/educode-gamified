<template>
  <div class="quest-container">

    <h1>{{ quest?.topic }}</h1>

    <div class="objective-card">
      <h2>Quest Objective</h2>
      <p>{{ quest?.objective }}</p>
    </div>

    <div class="example-card">
      <h3>Example</h3>
      <pre>Input: {{ quest?.example.input }}</pre>
      <pre>Output: {{ quest?.example.output }}</pre>
    </div>

    <Editor
      v-model="code"
      :language="language"
      height="50vh"
    />

    <RunToolbar
      :running="running"
      v-model="language"
      @run="runCode"
      @save="saveProgress"
    />

    <OutputConsole
      :text="output"
      :error="error"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Editor from '~/components/Editor.vue'
import RunToolbar from '~/components/RunToolbar.vue'
import OutputConsole from '~/components/OutputConsole.vue'

const route = useRoute()

const world = route.params.world as string
const id = Number(route.params.id)

// QUEST DATA
const quest = ref<any>(null)
const code = ref('')
const language = ref('python')

// OUTPUT
const output = ref('')
const error = ref('')
const running = ref(false)

/* Load quest */
onMounted(async () => {
  quest.value = await $fetch('/api/worlds/quest', {
    params: { world, node: id }
  })

  code.value = quest.value.starterCode
  language.value = quest.value.world // lock language to quest
})

/* Run Code */
const runCode = async () => {
  running.value = true
  output.value = ''
  error.value = ''

  try {
    const res = await $fetch('/api/worlds/quest-submit', {
      method: 'POST',
      body: {
        questId: quest.value.questId,
        world: quest.value.world,
        code: code.value
      }
    })

    output.value = res.output
    error.value = res.error

  } catch (err: any) {
    error.value = err?.data?.message || 'Execution failed.'
  }

  running.value = false
}

/* Save (optional) */
const saveProgress = () => {
  alert('Saved.')
}
</script>

<style scoped>
.quest-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.objective-card, .example-card {
  padding: 16px;
  background: rgba(255,255,255,0.05);
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.08);
}
</style>
