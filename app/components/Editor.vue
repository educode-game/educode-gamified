<template>
  <div ref="editorRoot" :style="{ height }" class="editor-root"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as monaco from 'monaco-editor'
const props = defineProps({
  modelValue: { type: String, default: '' },
  language: { type: String, default: 'python' },
  height: { type: String, default: '50vh' }
})
const emit = defineEmits(['update:modelValue'])
const editorRoot = ref(null)
let editorInstance = null

onMounted(() => {
  editorInstance = monaco.editor.create(editorRoot.value, {
    value: props.modelValue || '',
    language: props.language === 'cpp' ? 'cpp' : (props.language === 'java' ? 'java' : 'python'),
    theme: 'vs-dark',
    automaticLayout: true,
    minimap: { enabled: false },
    fontSize: 13
  })
  editorInstance.onDidChangeModelContent(() => {
    emit('update:modelValue', editorInstance.getValue())
  })
})

watch(() => props.language, (lang) => {
  if (!editorInstance) return
  const model = editorInstance.getModel()
  if (model) monaco.editor.setModelLanguage(model, lang === 'cpp' ? 'cpp' : (lang === 'java' ? 'java' : 'python'))
})

onBeforeUnmount(() => { editorInstance?.dispose() })
</script>

<style scoped>
.editor-root { border-radius: 8px; overflow: hidden; }
</style>
