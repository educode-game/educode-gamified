// server/utils/worldHelpers.ts
export function normalizeToCodeName(raw = ""): string {
  // returns canonical DB code_name (e.g. 'cpp-adventure')
  let s = String(raw ?? "").toLowerCase().trim()
  s = s.replace(/\s+/g, "-")
  s = s.replace("c++", "cpp").replace("cplusplus", "cpp")
  if (!s.endsWith("-adventure")) s = `${s}-adventure`
  return s
}

export function worldKeyFromCode(raw = ""): string {
  // returns simple key used for files and langMap (e.g. 'cpp')
  let s = String(raw ?? "").toLowerCase().trim()
  s = s.replace(/\s+/g, "-")
  s = s.replace("c++", "cpp").replace("cplusplus", "cpp")
  if (s.endsWith("-adventure")) s = s.replace(/-adventure$/, "")
  return s
}
