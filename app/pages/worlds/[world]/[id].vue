<template>
  <v-app>
    <Navbar />

    <v-container class="quest-page">
      <div class="quest-card">

        <!-- XP BAR -->
        <XPBar @level-up="onLevelUp" />

        <!-- QUEST CONTENT -->
        <div v-if="quest" class="quest-body">

          <h2 class="quest-title">Quest Objective</h2>
          <p class="quest-desc">{{ quest.objective }}</p>

          <h4>Example</h4>
          <div class="example-box">
            <p><strong>Input:</strong> {{ quest.example.input }}</p>
            <p><strong>Output:</strong> {{ quest.example.output }}</p>
          </div>

          <!-- Editor -->
          <Editor
            v-model="code"
            :language="language"
            height="55vh"
            :key="editorKey"
          />

          <!-- RunToolbar -->
          <RunToolbar
            :modelValue="language"
            :running="running"
            :disableLang="true"
            @run="runCode"
            @save="saveQuestCode"
          />

          <!-- Output -->
          <OutputConsole :text="output" :error="error" />

        </div>

        <div v-else class="loading-state">Loading quest…</div>

        <!-- Level Up Modal -->
        <LevelUpModal
          v-if="showLevelUp"
          :level="earnedLevel"
          @close="showLevelUp = false"
        />

      </div>
    </v-container>
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"
import Navbar from "~/components/Navbar.vue"
import XPBar from "~/components/XPBar.vue"
import Editor from "~/components/Editor.vue"
import RunToolbar from "~/components/RunToolbar.vue"
import OutputConsole from "~/components/OutputConsole.vue"
import LevelUpModal from "~/components/LevelUpModal.vue"
import { useRoute } from "vue-router"
import { useGameProgress } from "~/composables/useGameProgress"
import { useSupabase } from "~/composables/useSupabase"

// XP composable
const { addXp, profile } = useGameProgress()
const supabase = useSupabase()

// Route params
const route = useRoute()
const worldSlug = route.params.world as string
const node = Number(route.params.id)

// World → language mapping (snakecase slugs)
const worldToLang = {
  "classpath-crypt": "java",
  "namespace-necropolis": "cpp",
  "snakebyte-sanctum": "python"
} as const

const language = ref<"python" | "cpp" | "java">(
  (worldToLang as any)[worldSlug] ?? "python"
)

// Quest state
const quest = ref<any>(null)
const code = ref("")
const output = ref("")
const error = ref("")
const running = ref(false)
const editorKey = ref(0)

// Level-up modal
const showLevelUp = ref(false)
const earnedLevel = ref(0)

function onLevelUp(level: number) {
  earnedLevel.value = level
  showLevelUp.value = true
}

// Fetch quest
onMounted(async () => {
  const data = await $fetch("/api/worlds/quest", {
    params: { world: worldSlug, node }
  })

  quest.value = data
  code.value = data.starterCode
  language.value = data.world
  editorKey.value++
})

// Run Code
const runCode = async () => {
  running.value = true
  output.value = ""
  error.value = ""

  try {
    const res = await $fetch("/api/worlds/quest-submit", {
      method: "POST",
      body: {
        questId: quest.value.questId,
        world: quest.value.world,
        code: code.value
      }
    })

    output.value = res.output
    error.value = res.error

    // XP reward
    if (res.xp > 0) {
      await addXp(res.xp)
    }

    // 🔐 Unlock next node if correct
if (res.stars > 0 && profile.value?.id) {
  await $fetch("/api/worlds/unlock", {
    method: "POST",
    body: {
      userId: profile.value.id,
      world: worldSlug,
      completedNode: node
    }
  })
}

  } catch (e: any) {
    error.value = e?.data?.message || "Execution failed."
  }

  running.value = false
}

// Save button
const saveQuestCode = () => {
  window.alert("Saved progress!")
}
</script>

<style scoped>
.quest-page {
  margin-top: 70px;
}
.quest-card {
  background: rgba(10,12,26,0.9);
  padding: 20px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,0.05);
}
.quest-title {
  margin-bottom: 8px;
  color: white;
}
.quest-desc {
  color: #d2e4ff;
  margin-bottom: 12px;
}
.example-box {
  padding: 10px;
  background: rgba(255,255,255,0.06);
  border-radius: 8px;
  color: #e4efff;
  margin-bottom: 14px;
}
.loading-state {
  color: white;
  text-align: center;
}
</style>
