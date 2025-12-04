<template>
  <v-app>
    <Navbar />

    <div class="quest-page">
      <h1 class="title">Quest — {{ challenge?.description || "Loading..." }}</h1>

      <div v-if="loading" class="loading">
        Loading quest...
      </div>

      <div v-else class="content">

        <!-- LEFT: CODE EDITOR -->
        <div class="editor-section">
          <RunToolbar
            v-model:language="language"
            :running="running"
            @run="runCode"
          />

          <Editor v-model="code" :language="language" height="50vh" />

          <div class="actions">
            <v-btn class="btn-primary" :loading="submitting" @click="submitCode">
              Submit
            </v-btn>
            <v-btn outlined @click="runCode" :loading="running">
              Run
            </v-btn>
          </div>

          <OutputConsole :text="output" :errorText="errorText" />
        </div>

        <!-- RIGHT: DETAILS -->
        <div class="side-panel">
          <h3>Quest Info</h3>
          <p>Difficulty: {{ challenge?.difficulty }}</p>
          <p>XP Reward: {{ challenge?.xp_base }}</p>

          <div>
            <h4>Hints</h4>
            <v-btn
              v-for="n in challenge?.hints_available || 0"
              :key="n"
              small
              @click="buyHint(n)"
            >
              Buy Hint {{ n }} (1 ♦)
            </v-btn>
          </div>
        </div>
      </div>

      <QuestResultModal
        v-model:open="resultOpen"
        :stars="lastResult.stars"
        :xp="lastResult.xp"
        :level_up="lastResult.level_up"
        :diamonds="lastResult.diamonds_awarded"
      />
    </div>
  </v-app>
</template>


<script setup lang="ts">
import { ref, onMounted } from "vue"
import { useRoute } from "#imports"
import axios from "axios"
import Navbar from "@/components/Navbar.vue"
import Editor from "@/components/Editor.vue"
import RunToolbar from "@/components/RunToolbar.vue"
import OutputConsole from "@/components/OutputConsole.vue"
import QuestResultModal from "@/components/QuestResultModal.vue"
import { useSupabase } from "@/composables/useSupabase"

const route = useRoute()
const supabase = useSupabase()

const world = String(route.params.world)
const id = Number(route.params.id)

const loading = ref(true)
const challenge = ref<any>(null)
const language = ref("python")
const code = ref("")
const output = ref("")
const running = ref(false)
const submitting = ref(false)
const errorText = ref("")

const resultOpen = ref(false)
const lastResult = ref({
  stars: 0,
  xp: 0,
  level_up: false,
  diamonds_awarded: 0
})

console.log("🧩 Loading Quest:", { world, id })

// ---------------------------
// 📌 LOAD QUEST FROM LOCAL JSON
// ---------------------------
// onMounted(async () => {
//   try {
//     const file = `/data/${world}_quests.json` // now works, because public folder exposes files

//     const resp = await axios.get(file)
//     const quests = resp.data || []

//     const found = quests.find((q: any) => Number(q.node) === id)

//     if (!found) {
//       throw new Error(`Quest not found for ${world} node=${id}`)
//     }

//     challenge.value = found
//     language.value = found.language || (world === "python" ? "python" : world)
//     code.value = found.starterCode || ""

//   } catch (err: any) {
//     console.error("❌ Failed loading quest:", err)
//     errorText.value = err.response?.data?.message || err.message
//   } finally {
//     loading.value = false
//   }
// })

onMounted(async () => {
  try {
    console.log("📥 Fetching quest file:", `/data/${world}_quests.json`)

    const resp = await fetch(`/data/${world}_quests.json`)
    const quests = await resp.json()

    const found = quests.find((q: any) => Number(q.node) === id)

    if (!found) {
      throw new Error(`Quest not found for world=${world} & node=${id}`)
    }

    // Normalize fields so UI stays untouched
    challenge.value = {
      id: found.questId,
      title: found.topic,
      description: found.objective,
      difficulty: found.difficulty,
      xp_base: found.example?.output ? 10 : 0, // temporary XP logic until backend maps it
      hints_available: found.hints_available ?? 0,
      testCases: found.testCases,
      language: world === 'cpp' ? 'cpp' : world === 'java' ? 'java' : 'python',
    }

    code.value = found.starterCode
    language.value = challenge.value.language

    console.log("✅ Loaded Quest:", challenge.value)

  } catch (err: any) {
    console.error("❌ Failed to load quest:", err)
    errorText.value = err?.message || "Failed to load quest"
  } finally {
    loading.value = false
  }
})




// ---------------------------
// ▶ RUN CODE
// ---------------------------
const runCode = async () => {
  running.value = true
  output.value = ""
  errorText.value = ""

  try {
    const res = await axios.post("/api/challenges/run", {
      language: language.value,
      code: code.value,
      input: challenge.value?.testCases?.[0]?.input || ""
    })

    output.value = res.data?.output || JSON.stringify(res.data)
  } catch (err: any) {
    errorText.value = err?.response?.data?.message || err?.message || "Execution failed"
  }

  running.value = false
}



// ---------------------------
// 🏆 SUBMIT CODE (Progress Logic)
// ---------------------------
const submitCode = async () => {
  submitting.value = true

  try {
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData?.session?.access_token

    const res = await axios.post(
      "/api/worlds/quest-submit",
      { world_code: world, node_id: id, code: code.value },
      { headers: token ? { Authorization: `Bearer ${token}` } : {} }
    )

    lastResult.value = res.data
    resultOpen.value = true

  } catch (err: any) {
    console.error("❌ Submit failed:", err)
    errorText.value = err?.response?.data?.message || err?.message || "Submit failed"
  } finally {
    submitting.value = false
  }
}


// ---------------------------
// 💡 HINTS (placeholder)
// ---------------------------
const buyHint = async (n: number) => {
  alert(`Hint #${n} coming soon 🔍`)
}
</script>






<style scoped>
.quest-page {
  padding: 80px 24px;
  color: white;
}
.content {
  display: flex;
  gap: 24px;
}
.editor-section {
  flex: 1;
}
.side-panel {
  width: 300px;
  background: rgba(0,0,0,0.4);
  padding: 12px;
  border-radius: 10px;
}
.actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}
.btn-primary {
  background: linear-gradient(90deg,#9333ea,#00e5ff);
  color: white;
}
</style>
