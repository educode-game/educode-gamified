<template>
  <v-app>
    <Navbar />

    <v-container class="playground-page">

      <div class="playground-card">

        <!-- TITLE + TOOLBAR -->
        <div class="card-head">
          <h2>Coding Playground</h2>

          <RunToolbar
            v-model:language="language"
            :running="running"
            @run="onRun"
            @save="onSave"
          />
        </div>

        <!-- MAIN LAYOUT -->
        <div class="editor-area">
          
          <!-- MONACO EDITOR -->
          <Editor
            v-model="code"
            :language="language"
            :height="editorHeight"
            :key="editorKey"
          />

          <!-- RIGHT PANEL -->
          <div class="right-panel">

            <!-- template -->
            <div class="template-toggle">
              <label>Starter Template</label>
              <pre class="template-box">{{ templatePreview }}</pre>
            </div>

            <!-- snippets -->
            <div class="snippet-list">
              <h4>Saved Snippets</h4>

              <div v-if="snippetsLoading" class="muted">Loading…</div>

              <ul v-else>
                <li v-for="s in snippets" :key="s.id">
                  <div class="snippet-item">
                    <div @click="loadSnippet(s)" class="snippet-body">
                      <strong>{{ s.title }}</strong>
                      <div class="meta">
                        {{ s.language.toUpperCase() }} •
                        {{ new Date(s.created_at).toLocaleString() }}
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

        <!-- OUTPUT -->
        <OutputConsole :text="output" :error="runError" />

      </div>
    </v-container>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue"
import Navbar from "@/components/Navbar.vue"
import Editor from "@/components/Editor.vue"
import RunToolbar from "@/components/RunToolbar.vue"
import OutputConsole from "@/components/OutputConsole.vue"
import { useRunner } from "@/composables/useRunner"
import { useSnippets } from "@/composables/useSnippets"
import { useSupabase } from "@/composables/useSupabase"

// Runner (handles Judge0 run)
const { output, run, running, error: runError } = useRunner()

// Snippets System
const { save, list, deleteSnippet, snippets, loading: snippetsLoading } = useSnippets()

const supabase = useSupabase()

const language = ref<"python" | "cpp" | "java">("python")
const editorHeight = ref("56vh")
const editorKey = ref(0)
const code = ref("")

// Starter templates
const templates = {
  python: `# Python Example
print("Hello, Educode!")`,

  cpp: `#include <iostream>
using namespace std;

int main() {
  cout << "Hello, Educode!";
  return 0;
}`,

  java: `public class Main {
  public static void main(String[] args) {
    System.out.println("Hello, Educode!");
  }
}`
} as const

const templatePreview = computed(() => templates[language.value])

// Choose new template if unchanged
watch(language, (newLang, oldLang) => {
  if (code.value.trim() === templates[oldLang].trim()) {
    code.value = templates[newLang]
  }
  editorKey.value += 1
})

// Load Snippets
const loadSnippets = async () => list()

onMounted(() => {
  code.value = templates[language.value]
  loadSnippets()
})

// RUN CODE
const onRun = async () => {
  await run(language.value, code.value)
}

// SAVE SNIPPET
const onSave = async () => {
  const session = await supabase.auth.getSession()
  if (!session?.data?.session) return alert("Login required")

  await save(`Playground Snippet — ${language.value}`, language.value, code.value)
  await list()
  alert("Saved successfully!")
}

// Load snippet into editor
const loadSnippet = (s: any) => {
  language.value = s.language
  code.value = s.code
  editorKey.value += 1
}

// Delete snippet
const handleDelete = async (id: string) => {
  if (!confirm("Delete this snippet permanently?")) return
  await deleteSnippet(id)
}
</script>

<style scoped>
/* PAGE LAYOUT */
.playground-page {
  width: 92%;
  max-width: 1200px;
  margin: 80px auto;
}

/* CARD */
.playground-card {
  background: rgba(10, 10, 25, 0.92);
  border-radius: 16px;
  padding: 18px;
  backdrop-filter: blur(6px);
}

/* SECTION: TOP BAR */
.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-head h2 {
  font-size: 1.3rem;
  background: linear-gradient(90deg,#9333ea,#00e5ff);
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* LAYOUT GRID */
.editor-area {
  margin-top: 12px;
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 12px;
}

/* RIGHT PANEL */
.right-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.template-toggle label {
  font-weight: 600;
  color: #bfeaff;
}
.template-box {
  background: rgba(255,255,255,0.05);
  padding: 10px;
  border-radius: 8px;
  font-family: monospace;
  font-size: 0.85rem;
}

/* SNIPPETS LIST */
.snippet-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.snippet-item {
  display: flex;
  justify-content: space-between;
  border: 1px solid rgba(255,255,255,0.06);
  padding: 8px;
  border-radius: 6px;
}

.snippet-body {
  cursor: pointer;
}

.meta {
  opacity: 0.6;
  font-size: 0.75rem;
}

/* OUTPUT */
.output-area {
  margin-top: 16px;
}

.btn.small {
  padding: 4px 8px;
  font-size: 0.8rem;
}

.btn.outline {
  border: 1px solid #00e5ff;
  background: none;
}
</style>
