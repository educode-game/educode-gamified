<template>
  <div ref="editorRoot" :style="{ height }" class="editor-root"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from "vue"
import * as monaco from "monaco-editor"

const props = defineProps<{
  modelValue: string
  language?: string
  height?: string
}>()

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void
}>()

const editorRoot = ref<HTMLElement | null>(null)
let editorInstance: monaco.editor.IStandaloneCodeEditor | null = null
let model: monaco.editor.ITextModel | null = null

const height = props.height ?? "50vh"

const mapLang = (lang: string | undefined): string => {
  if (!lang) return "python"
  if (lang === "cpp") return "cpp"
  if (lang === "java") return "java"
  return "python"
}

onMounted(async () => {
  await nextTick()
  const initialLang = mapLang(props.language)
  model = monaco.editor.createModel(props.modelValue || "", initialLang)

  if (!editorRoot.value) return

  editorInstance = monaco.editor.create(editorRoot.value, {
    model,
    language: initialLang,
    theme: "vs-dark",
    automaticLayout: true,
    minimap: { enabled: false },
    fontSize: 13,
    wordWrap: "off"
  })

  editorInstance.onDidChangeModelContent(() => {
    if (!editorInstance) return
    emit("update:modelValue", editorInstance.getValue())
  })
})

watch(
  () => props.language,
  (lang) => {
    if (!editorInstance || !model) return
    const newLang = mapLang(lang)
    monaco.editor.setModelLanguage(model, newLang)
  }
)

watch(
  () => props.modelValue,
  (v) => {
    if (!editorInstance || !model) return
    const current = editorInstance.getValue()
    if (current === v) return

    const selection = editorInstance.getSelection()
    model.pushEditOperations(
      [],
      [{ range: model.getFullModelRange(), text: v ?? "" }],
      () => (selection ? [selection] : null)
    )
  }
)

onBeforeUnmount(() => {
  editorInstance?.dispose()
  model?.dispose()
})
</script>

<style scoped>
.editor-root {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.04);
}
</style>
