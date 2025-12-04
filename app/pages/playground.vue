<template>
  <v-app>
    <Navbar />

    <v-container class="playground-page">
      <div class="playground-card">
        <div class="card-head">
          <h2>Coding Playground</h2>

          <div class="head-controls">
            <RunToolbar
              v-model:language="language"
              :running="running"
              @run="onRun"
              @save="onSave"
            />
          </div>
        </div>

        <div class="editor-area">
          <Editor
            v-model="code"
            :language="language"
            :height="editorHeight"
            :key="editorKey"
          />

          <div class="right-panel">
            <div class="template-toggle">
              <label>Template</label>
              <pre class="template-box">{{ templatePreview }}</pre>
            </div>

            <div class="snippet-list">
              <h4>Saved snippets</h4>

              <div v-if="snippetsLoading" class="muted">Loading…</div>

              <ul v-else>
                <li v-for="s in snippets" :key="s.id">
                  <div class="snippet-item">
                    <div @click="loadSnippet(s)" class="snippet-body">
                      <strong>{{ s.title }}</strong>
                      <div class="meta">
                        {{ (s.language || '').toUpperCase() }} •
                        {{ s.created_at ? new Date(s.created_at).toLocaleString() : '' }}
                      </div>
                    </div>
                    <div class="snippet-actions">
                      <button class="btn small" @click="loadSnippet(s)">Load</button>
                      <button class="btn small outline" @click="handleDelete(s.id)">Delete</button>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div class="output-area">
          <OutputConsole :text="output" :error="runError" />
        </div>
      </div>
    </v-container>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import Navbar from '@/components/Navbar.vue'
import Editor from '@/components/Editor.vue'
import RunToolbar from '@/components/RunToolbar.vue'
import OutputConsole from '@/components/OutputConsole.vue'
import { useRunner } from '@/composables/useRunner'
import { useSnippets } from '@/composables/useSnippets'
import { useSupabase } from '@/composables/useSupabase'

const supabase = useSupabase()
const { output, run, running, error: runError } = useRunner()
const { save, list, deleteSnippet, snippets, loading: snippetsLoading } = useSnippets()

const language = ref<'python' | 'cpp' | 'java'>('python')
const editorKey = ref(0)
const editorHeight = ref('56vh')
const code = ref('')
const showSide = ref(true)

// templates
const templates = {
  python: `# Sample Syntax\nprint('Hello Educode')`,
  cpp: `#include <iostream>\nusing namespace std;\n\nint main(){ cout << "Hello Educode!"; return 0; }`,
  java: `public class Main { public static void main(String[] args) { System.out.println("Hello Educode!"); } }`
} as const

const templatePreview = computed(() => templates[language.value])

const setTemplate = (lang: typeof language.value) => {
  code.value = templates[lang]
  editorKey.value += 1
}

watch(language, (newLang, oldLang) => {
  const oldTemplate = templates[oldLang]
  if (code.value.trim() === oldTemplate.trim()) {
    setTemplate(newLang)
  } else {
    editorKey.value += 1
  }
})

const loadSnippets = async () => {
  await list()
}

onMounted(() => {
  setTemplate(language.value)
  loadSnippets()
})

const onRun = async () => {
  await run(language.value, code.value)
}

const onSave = async () => {
  try {
    const token = (await supabase.auth.getSession())?.data?.session?.access_token
    await save('Playground snippet', language.value, code.value) // server will use auth from headers / cookies
    await list()
    alert('Saved to Playground snippets')
  } catch (e: any) {
    alert('Save failed: ' + (e?.message || String(e)))
  }
}

const loadSnippet = (s: any) => {
  language.value = s.language
  code.value = s.code
  editorKey.value += 1
}

const handleDelete = async (id: string) => {
  if (!confirm('Delete this snippet?')) return
  await deleteSnippet(id)
}
</script>


<style scoped>
/* EduCode Playground — glowing theme (matches dashboard) */
.playground-page {
  width: 92%;
  max-width: 1200px;
  margin: 80px auto 80px;
  padding: 10px;
}

.playground-card {
  background: rgba(10, 10, 25, 0.88);
  border-radius: 16px;
  padding: 18px;
  box-shadow: 0 10px 35px rgba(0,229,255,0.08);
  border: 1px solid rgba(255,255,255,0.04);
}

/* head */
.card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.card-head h2 {
  margin: 0;
  font-size: 1.25rem;
  color: white;
  background: linear-gradient(90deg,#9333ea,#00e5ff);
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.head-controls { display:flex; gap:8px; align-items:center; }

/* editor area: responsive columns */
.editor-area {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 12px;
}
.editor-area .right-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.template-toggle label { color: rgba(255,255,255,0.8); font-weight: 600; margin-bottom: 6px; display:block; }
.template-box {
  background: rgba(0,0,0,0.6);
  padding: 10px;
  border-radius: 8px;
  font-family: monospace;
  font-size: 0.85rem;
  white-space: pre-wrap;
  color: #dbe9ff;
  border: 1px solid rgba(255,255,255,0.04);
}

/* snippet list */
.snippet-list h4 { margin: 0 0 6px 0; color: #cfeffb; }
.snippet-list ul { list-style: none; padding: 0; margin: 0; display:flex; flex-direction:column; gap:8px; max-height: 280px; overflow:auto; }
.snippet-list li { padding: 8px; border-radius: 8px; background: rgba(255,255,255,0.02); cursor: pointer; border: 1px solid rgba(255,255,255,0.02); }
.snippet-list li:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,229,255,0.04); }

/* output */
.output-area { margin-top: 12px; }

/* small responsive tweaks */
@media (max-width: 980px) {
  .editor-area { grid-template-columns: 1fr; }
  .playground-page { margin-top: 120px; }
  .right-panel { order: 2; }
}

/* mobile */
@media (max-width: 520px) {
  .playground-page { width: 96%; margin: 100px auto 60px; padding: 8px; }
  .template-box { font-size: 0.75rem; white-space: pre-wrap; }
}
</style>
