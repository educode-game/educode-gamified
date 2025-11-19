import * as monaco from "monaco-editor"

self.MonacoEnvironment = {
  getWorkerUrl: function (_, label) {
    if (label === "json") return "/monaco/json.worker.js"
    if (label === "css") return "/monaco/css.worker.js"
    if (label === "html") return "/monaco/html.worker.js"
    if (label === "typescript" || label === "javascript")
      return "/monaco/ts.worker.js"
    return "/monaco/editor.worker.js"
  }
}
