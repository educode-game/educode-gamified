<template>
  <v-app>
    <Navbar />

    <div class="quest-page">
      <h1 class="title">Quest — {{ challenge?.description || "Loading..." }}</h1>

      <div v-if="loading" class="loading">Loading quest...</div>

      <div v-else class="content">

        <!-- LEFT SIDE -->
        <div class="editor-section">
          <RunToolbar
            v-model:language="language"
            :running="running"
            :disableLang="true"
            @run="runCode"
          />

          <Editor v-model="code" :language="language" height="50vh" />

          <div class="actions">
            <v-btn class="btn-primary" :loading="submitting" @click="submitCode">
              SUBMIT
            </v-btn>
          </div>

          <OutputConsole :text="formattedOutput" :error="runError" />
        </div>

        <!-- RIGHT INFO -->
        <div class="side-panel">
          <h3>Quest Info</h3>
          <p><strong>Difficulty:</strong> {{ challenge?.difficulty }}</p>
          <p><strong>XP Reward:</strong> {{ challenge?.xp_base }}</p>

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

      <!-- RESULT MODAL -->
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
import { ref, computed, onMounted } from "vue"
import axios from "axios"
import { useRoute } from "#imports"
import Navbar from "@/components/Navbar.vue"
import Editor from "@/components/Editor.vue"
import RunToolbar from "@/components/RunToolbar.vue"
import OutputConsole from "@/components/OutputConsole.vue"
import QuestResultModal from "@/components/QuestResultModal.vue"
import { useRunner } from "@/composables/useRunner"
import { useSupabase } from "@/composables/useSupabase"


interface RunResult {
  stdout?: string | null
  stderr?: string | null
  compile_output?: string | null
  message?: string | null
  status?: { id: number; description: string } | null
}

const route = useRoute()
const world = String(route.params.world)
const id = Number(route.params.id)

const supabase = useSupabase()
const { output, run, running, error } = useRunner()

const loading = ref(true)
const challenge = ref<any>(null)

const language = ref("python")
const code = ref("")
const submitting = ref(false)

const runError = computed(() => error.value)

const resultOpen = ref(false)
const lastResult = ref({
  stars: 0,
  xp: 0,
  level_up: false,
  diamonds_awarded: 0
})


// CLEAN OUTPUT FN
const normalizeResult = (result: RunResult): string => {
  if (!result) return "⚠ No response received."

  if (result.stdout && result.stdout.trim()) return result.stdout.trim()
  if (result.message && result.message.trim()) return result.message.trim() // Java sometimes uses message
  if (result.stderr && result.stderr.trim()) return `❌ Runtime Error:\n${result.stderr.trim()}`
  if (result.compile_output && result.compile_output.trim()) return `⚠ Compilation Error:\n${result.compile_output.trim()}`

  return "⚠ Code executed but produced no output."
}

// FINAL TEXT SHOWN IN UI
const formattedOutput = computed(() => {
  const result = output.value

  if (!result) return ""

  if (typeof result === "string") return result
  if (result.stdout && result.stdout.trim() !== "") return result.stdout.trim()
  if (result.stderr) return `❌ Runtime Error:\n${result.stderr}`
  if (result.compile_output) return `⚠ Compilation Error:\n${result.compile_output}`

  return "⚠ Code executed but produced no output."
})



// LOAD QUEST JSON
onMounted(async () => {
  try {
    const resp = await axios.get(`/data/${world}_quests.json`)
    const found = resp.data.find((q: any) => Number(q.node) === id)

    if (!found) throw new Error("Quest not found")

    language.value = world
    code.value = found.starterCode || ""

    challenge.value = {
      description: found.objective,
      difficulty: found.difficulty,
      xp_base: 10,
      hints_available: found.hints_available ?? 0,
      testCases: found.testCases,
    }
  } catch (err) {
    console.error("❌ Failed loading quest:", err)
  } finally {
    loading.value = false
  }
})


// RUN CODE
const runCode = async () => {
  const sampleInput = challenge.value?.testCases?.[0]?.input ?? ""
  await run(language.value, code.value, sampleInput)
}



// SUBMIT / VALIDATE
/* ---------------- SUBMIT & SCORING ---------------- */
const submitCode = async () => {
  submitting.value = true

  try {
    const cases = challenge.value.testCases || []
    let passed = 0
    let attempts = 0

    for (const test of cases) {
      attempts++
      await run(language.value, code.value, test.input ?? "")

      const result = output.value as RunResult
      const cleaned = result?.stdout?.trim() || ""
      const expected = String(test.output).trim()

      if (cleaned === expected) passed++
    }

    // ---------------- Result Decision ----------------
    const total = cases.length

    if (passed !== total) {
      output.value = `⚠ ${passed}/${total} tests passed.\nTry again!`
      submitting.value = false
      return
    }

    // ---------------- Scoring Rules ----------------
    let stars = 1
    let xpEarned = 0

    if (passed === total) {
      stars = attempts === total ? 3 : 2  // perfect first try = 3 stars
      xpEarned = stars === 3 ? challenge.value.xp_base : Math.floor(challenge.value.xp_base / 2)
    }

    // ---------------- Save to Backend ----------------
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData?.session?.access_token

    const saveResponse = await axios.post(
      "/api/worlds/quest-submit",
      {
        world_code: world,
        node_id: id,
        stars,
        xp: xpEarned,
        code: code.value,
      },
      token ? { headers: { Authorization: `Bearer ${token}` }} : {}
    )

    // ---------------- Update UI ----------------
    lastResult.value = {
      stars,
      xp: xpEarned,
      level_up: saveResponse.data?.level_up ?? false,
      diamonds_awarded: saveResponse.data?.diamonds_awarded ?? 0
    }

    resultOpen.value = true
    output.value = `🎉 All tests passed successfully!\n⭐ Stars Earned: ${stars}\n✨ XP: +${xpEarned}`

  } catch (err) {
    console.error("❌ Submit failed:", err)
    output.value = "❌ Submission error. Try again."
  }

  submitting.value = false
}


const buyHint = (n: number) => {
  alert(`Hint #${n} coming soon 🔍`)
}
</script>

<style scoped>
.quest-page { padding: 80px 24px; color: white; }
.content { display: flex; gap: 24px; }
.editor-section { flex: 1; }
.side-panel {
  width: 300px;
  background: rgba(0,0,0,0.4);
  padding: 12px;
  border-radius: 10px;
}
.actions { display: flex; gap: 8px; margin-top: 10px; }
.btn-primary {
  background: linear-gradient(90deg,#9333ea,#00e5ff);
  color: white;
}
</style>
