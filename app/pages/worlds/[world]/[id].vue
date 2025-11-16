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

          <!-- EDITOR -->
          <Editor
            v-model="code"
            :language="language"
            height="55vh"
            :key="editorKey"
          />

          <!-- Run + Save -->
          <RunToolbar
            :modelValue="language"
            :disableLang="true"
            :running="running"
            @run="runCode"
            @save="saveQuestCode"
          />

          <!-- OUTPUT -->
          <OutputConsole :text="output" :error="error" />
        </div>

        <div v-else class="loading-state">
          Loading quest…
        </div>

        <!-- LEVEL UP MODAL -->
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

// XP composable
const { addXp } = useGameProgress()

// ROUTING
const route = useRoute()
const worldSlug = route.params.world as string
const node = Number(route.params.id)

// 🔥 WORLD → LANGUAGE MAP
const worldToLanguage: Record<string, "python" | "cpp" | "java"> = {
  "snakebyte-sanctum": "python",
  "namespace-necropolis": "cpp",
  "classpath-crypt": "java",
}

// final mapped language
const mappedWorld =
  worldToLanguage[worldSlug] ?? "python"

// reactive state
const language = ref<"python" | "cpp" | "java">(mappedWorld)
const quest = ref<any>(null)
const code = ref("")
const output = ref("")
const error = ref("")
const running = ref(false)
const editorKey = ref(0)

// modal state
const showLevelUp = ref(false)
const earnedLevel = ref(0)

function onLevelUp(level: number) {
  earnedLevel.value = level
  showLevelUp.value = true
}

// ============================
// 🔥 FETCH QUEST DATA
// ============================
onMounted(async () => {
  try {
    const data = await $fetch("/api/worlds/quest", {
      params: {
        world: mappedWorld,
        node,
      },
    })

    quest.value = data
    code.value = data.starterCode
    language.value = mappedWorld
    editorKey.value++

  } catch (err) {
    console.error("Quest load failed:", err)
  }
})

// ============================
// 🔥 RUN CODE
// ============================
const runCode = async () => {
  running.value = true
  output.value = ""
  error.value = ""

  try {
    const res = await $fetch("/api/worlds/quest-submit", {
      method: "POST",
      body: {
        questId: quest.value.questId,
        world: mappedWorld,
        code: code.value,
      },
    })

    output.value = res.output
    error.value = res.error

    if (res.xp && res.xp > 0) {
      await addXp(res.xp)
    }

  } catch (e: any) {
    error.value =
      e?.data?.message || "Execution failed."
  }

  running.value = false
}

// ============================
// SAVE PROGRESS BUTTON
// ============================
const saveQuestCode = () => {
  window.alert("Progress saved!")
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
