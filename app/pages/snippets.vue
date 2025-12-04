<template>
  <v-app>
    <Navbar />

    <v-container class="container">
      <div class="card">
        <div class="card-head">
          <h2>Saved Snippets</h2>
          <v-btn @click="refresh">Refresh</v-btn>
        </div>

        <div v-if="loading" class="muted">Loading…</div>

        <div v-else-if="snippets.length === 0" class="muted">No snippets yet.</div>

        <ul v-else class="snippet-list">
          <li v-for="s in snippets" :key="s.id" class="snippet-item">
            <div class="title">{{ s.title }}</div>
            <div class="meta">{{ (s.language || '').toUpperCase() }} • {{ new Date(s.created_at || s.createdAt || Date.now()).toLocaleString() }}</div>
            <pre class="code-preview">{{ s.code }}</pre>
          </li>
        </ul>
      </div>
    </v-container>
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Navbar from '@/components/Navbar.vue'
import { useSnippets } from '@/composables/useSnippets'

const { list, snippets, loading } = useSnippets()

const refresh = async () => {
  await list()
}

onMounted(async () => {
  await list()
})
</script>

<style scoped>
/* small styles — keep your existing look */
.snippet-list { list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:12px; }
.snippet-item { background: rgba(255,255,255,0.02); padding:12px; border-radius:8px; }
.code-preview { background: rgba(0,0,0,0.6); padding:8px; border-radius:6px; font-family:monospace; max-height:200px; overflow:auto; }
</style>
