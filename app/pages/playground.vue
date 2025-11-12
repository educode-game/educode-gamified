<template>
  <v-app>
    <Navbar />
    <v-container class="container">
      <div class="card">
        <h2>Coding Playground</h2>
        <RunToolbar v-model:language="language" @run="onRun" @save="onSave" />
        <Editor v-model="code" :language="language" height="50vh" />
        <div style="margin-top:12px">
          <OutputConsole :text="output" />
        </div>
      </div>
    </v-container>
  </v-app>
</template>

<script setup>
import Navbar from '@/components/Navbar.vue'
import Editor from '@/components/Editor.vue'
import RunToolbar from '@/components/RunToolbar.vue'
import OutputConsole from '@/components/OutputConsole.vue'
import { useRunner } from '@/composables/useRunner'
import { useSnippets } from '@/composables/useSnippets'

const language = ref('python')
const code = ref(`# Write your ${language.value} code here\nprint('Hello Educode')`)
const { run, output } = useRunner()
const { save } = useSnippets()

const onRun = async () => await run(language.value, code.value)
const onSave = async () => {
  const token = (await useSupabase().auth.getSession())?.data?.session?.access_token
  await save('Playground snippet', language.value, code.value, token)
  alert('Saved to Playground snippets')
}
</script>
