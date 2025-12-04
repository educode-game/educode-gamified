import * as monaco from "monaco-editor";

self.MonacoEnvironment = {
  getWorker: (_moduleId, label) => {
    if (label === "json") {
      return new Worker("/monaco/json.worker.js", { type: "classic" });
    }
    if (label === "css") {
      return new Worker("/monaco/css.worker.js", { type: "classic" });
    }
    if (label === "html") {
      return new Worker("/monaco/html.worker.js", { type: "classic" });
    }
    if (label === "typescript" || label === "javascript") {
      return new Worker("/monaco/ts.worker.js", { type: "classic" });
    }

    return new Worker("/monaco/editor.worker.js", { type: "classic" });
  }
};

export default defineNuxtPlugin(() => {
  return {
    provide: { monaco }
  };
});
