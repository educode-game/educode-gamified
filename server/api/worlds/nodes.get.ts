// server/api/worlds/nodes.get.ts
import { getQuery, createError } from "h3"
import { supabaseServer } from "../../utils/supabaseServerClient"

function normalizeWorld(raw: any) {
  let s = String(raw ?? "").toLowerCase().trim()
  s = s.replace(/\s+/g, "-")
  s = s.replace("c++", "cpp")
  s = s.replace("cplusplus", "cpp")
  return s
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  let world_code = normalizeWorld(query.world || query.world_code || "")

  if (!world_code) {
    throw createError({ statusCode: 400, message: "Missing world_code" })
  }

  const candidates = [world_code]
  if (!world_code.endsWith("-adventure")) candidates.push(`${world_code}-adventure`)
  if (world_code.endsWith("-adventure")) candidates.push(world_code.replace("-adventure",""))

  const client = supabaseServer

  // find the world row by trying candidates
  let worldRow: any = null
  for (const cand of candidates) {
    const { data: w, error: wError } = await client
      .from("worlds")
      .select("id, total_nodes")
      .eq("code_name", cand)
      .maybeSingle()
    if (!wError && w) {
      worldRow = w
      break
    }
  }

  if (!worldRow) {
    throw createError({ statusCode: 404, message: "World not found" })
  }

  const { data: rows, error } = await client
    .from("challenges")
    .select("id, slug, title, difficulty, order_index, map_position")
    .eq("world_id", worldRow.id)
    .order("order_index", { ascending: true })

  if (error) {
    console.error("nodes.get error", error)
    throw createError({ statusCode: 500, message: "Failed to load nodes" })
  }

  // Normalize each map_position: if missing, compute fallback grid coordinates
  const spacing = 120
  const perRow = 5
  const defaultOffset = 40

  const nodes = (rows || []).map((c: any, idx: number) => {
    const mp = (c.map_position && typeof c.map_position === "object") ? c.map_position : {}
    let x = Number(mp.x ?? NaN)
    let y = Number(mp.y ?? NaN)

    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      const ord = (typeof c.order_index === "number" && c.order_index > 0) ? c.order_index - 1 : idx
      x = (ord % perRow) * spacing + defaultOffset
      y = Math.floor(ord / perRow) * spacing + defaultOffset
    }

    return {
      id: c.id,
      slug: c.slug,
      title: c.title,
      difficulty: c.difficulty,
      order_index: c.order_index,
      x,
      y,
      raw_map_position: c.map_position ?? {}
    }
  })

  return { nodes }
})
