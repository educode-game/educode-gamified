  // server/api/worlds/info.get.ts
  import { getQuery, createError } from "h3"
  import { supabaseServer } from "../../utils/supabaseServerClient"

  function normalizeWorldSlug(raw: string) {
    let s = String(raw ?? "").toLowerCase().trim()
    s = s.replace(/\s+/g, "-")
    // Accept both `cpp` and `c++` and `cpp-adventure` etc.
    s = s.replace("c++", "cpp")
    s = s.replace("cplusplus", "cpp")
    // if user passed `cpp-adventure` leave as-is; if passed `cpp` map to `cpp-adventure` if your DB stores that
    // We'll keep flexible: prefer exact DB match, so we test multiple candidates later.
    return s
  }

  export default defineEventHandler(async (event) => {
    const q = getQuery(event)
    const raw = String(q.world || q.world_code || "")
    if (!raw) throw createError({ statusCode: 400, message: "Missing world parameter" })

    const s = normalizeWorldSlug(raw)

    const candidates = new Set<string>()
    candidates.add(s)
    // also try suffix variations to match DB values
    if (!s.endsWith("-adventure")) candidates.add(`${s}-adventure`)
    if (s.endsWith("-adventure")) candidates.add(s.replace("-adventure", ""))

    // Also map common aliases
    if (s === "cpp") {
      candidates.add("cpp-adventure")
    } else if (s === "python") {
      candidates.add("python-adventure")
    } else if (s === "java") {
      candidates.add("java-adventure")
    }

    // Query the DB trying candidates (prefer exact)
    const client = supabaseServer
    for (const cand of Array.from(candidates)) {
      const { data, error } = await client
        .from("worlds")
        .select("*")
        .eq("code_name", cand)
        .maybeSingle()

      if (!error && data) {
        return { world: data }
      }
    }

    throw createError({ statusCode: 404, message: `World not found for '${raw}'` })
  })
