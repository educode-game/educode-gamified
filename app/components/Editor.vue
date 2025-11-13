<template>
  <div ref="editorRoot" :style="{ height }" class="editor-root"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import * as monaco from 'monaco-editor'

const props = defineProps({
  modelValue: { type: String, default: '' },
  language: { type: String, default: 'python' },
  height: { type: String, default: '50vh' }
})
const emit = defineEmits(['update:modelValue'])

const editorRoot = ref<HTMLElement | null>(null)
let editorInstance: monaco.editor.IStandaloneCodeEditor | null = null
let model: monaco.editor.ITextModel | null = null

const mapLang = (lang: string) => {
  if (lang === 'cpp') return 'cpp'
  if (lang === 'java') return 'java'
  return 'python'
}

onMounted(async () => {
  await nextTick()
  const initialLang = mapLang(props.language)
  model = monaco.editor.createModel(props.modelValue || '', initialLang)
  editorInstance = monaco.editor.create(editorRoot.value!, {
    model,
    language: initialLang,
    theme: 'vs-dark',
    automaticLayout: true,
    minimap: { enabled: false },
    fontSize: 13,
    wordWrap: 'off'
  })

  editorInstance.onDidChangeModelContent(() => {
    emit('update:modelValue', editorInstance!.getValue())
  })
})

watch(() => props.language, (lang) => {
  if (!editorInstance || !model) return
  const newLang = mapLang(lang)
  monaco.editor.setModelLanguage(model, newLang)
})

// also watch for external modelValue changes
watch(() => props.modelValue, (v) => {
  if (!editorInstance || !model) return
  if (editorInstance.getValue() !== v) {
    // update model without moving cursor to start
    const selection = editorInstance.getSelection()
    model.pushEditOperations([], [{ range: model.getFullModelRange(), text: v ?? '' }], () => selection ? [selection] : null)
  }
})

onBeforeUnmount(() => {
  editorInstance?.dispose()
  model?.dispose()
})
</script>

<style scoped>
.editor-root { border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,0.04); }
</style>
