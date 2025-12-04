// server/scripts/import-quests.ts
/**
 * MIGRATION SCRIPT:
 * Imports all *_quests.json in /server/data into:
 *   - challenges
 *   - challenge_hints
 *
 * SAFE, TYPE-CORRECT, AND MATCHING YOUR SCHEMA
 *
 * Run: npx ts-node server/scripts/import-quests.ts
 */

import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

// -----------------------------------------------------------------------------
// ENV VALIDATION
// -----------------------------------------------------------------------------
const SUPABASE_URL = process.env.NUXT_SUPABASE_URL
const SUPABASE_KEY = process.env.NUXT_SUPABASE_SERVICE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing env: NUXT_SUPABASE_URL / NUXT_SUPABASE_SERVICE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false }
})

// -----------------------------------------------------------------------------
// HELPERS
// -----------------------------------------------------------------------------
function detectWorldKey(filename: string): string {
  const f = filename.toLowerCase()
  if (f.includes('cpp')) return 'cpp'
  if (f.includes('python')) return 'python'
  if (f.includes('java')) return 'java'
  return ''
}

function toCodeName(key: string) {
  return key.endsWith('-adventure') ? key : `${key}-adventure`
}

// -----------------------------------------------------------------------------
// MAIN IMPORT FUNCTION
// -----------------------------------------------------------------------------
async function importQuest(worldKey: string, quest: any) {
  const slug = String(quest.slug ?? quest.questId ?? '').trim()
  if (!slug) {
    console.warn(`⚠ Skipping quest with no slug/questId`, quest)
    return null
  }

  // --- Find world row ---
  const code_name = toCodeName(worldKey)

  const { data: worldRow, error: worldError } = await supabase
    .from('worlds')
    .select('id')
    .eq('code_name', code_name)
    .maybeSingle()

  if (worldError) {
    throw new Error(`DB error reading world: ${worldError.message}`)
  }
  if (!worldRow) {
    throw new Error(`World '${code_name}' not found. Create worlds first.`)
  }

  // --- Challenge fields mapping ---
  const title = quest.title ?? slug

  const description =
    String(
      quest.description ??
      quest.objective ??
      quest.topic ??
      'No description'
    ).slice(0, 4000)

  const starter_code = quest.starterCode ?? quest.starter_code ?? ''

  // expected_output: take first testcase's output if available.
  let expected_output = ''
  if (Array.isArray(quest.testCases) && quest.testCases.length > 0) {
    expected_output = String(quest.testCases[0].output ?? '')
  }

  const difficulty = quest.difficulty ?? 'easy'
  const order_index = Number(quest.node ?? quest.order_index ?? 0)
  const xp_base = Number(quest.xpBase ?? quest.xp_base ?? 100)

  const challengePayload = {
    world_id: worldRow.id,
    slug,
    title,
    description,
    starter_code,
    expected_output,
    difficulty,
    order_index,
    xp_base
  }

  // --- UPSERT CHALLENGE ---
  const { data: inserted, error: insertErr } = await supabase
    .from('challenges')
    .upsert([challengePayload], { onConflict: 'slug' })
    .select()
    .maybeSingle()

  if (insertErr) {
    throw new Error(`Failed to upsert challenge '${slug}': ${insertErr.message}`)
  }

  if (!inserted) {
    throw new Error(`Challenge '${slug}' upsert returned no data`)
  }

  // --- HINTS (if exists) ---
  if (Array.isArray(quest.hints)) {
    for (const h of quest.hints) {
      const hint_number = Number(h.hint_number ?? h.number ?? 0)
      if (![1, 2, 3].includes(hint_number)) continue

      const hint_text = String(h.hint_text ?? h.text ?? '').trim()

      const { error: hintErr } = await supabase
        .from('challenge_hints')
        .upsert(
          [
            {
              challenge_id: inserted.id,
              hint_number,
              hint_text
            }
          ],
          { onConflict: 'challenge_id,hint_number' }
        )

      if (hintErr) {
        console.warn(
          `⚠ Failed to upsert hint ${hint_number} for slug '${slug}':`,
          hintErr.message
        )
      }
    }
  }

  return inserted
}

// -----------------------------------------------------------------------------
// ENTRY POINT
// -----------------------------------------------------------------------------
async function main() {
  try {
    const DATA_DIR = path.join(process.cwd(), 'server', 'data')
    if (!fs.existsSync(DATA_DIR)) {
      throw new Error(`Data folder not found: ${DATA_DIR}`)
    }

    const files = fs
      .readdirSync(DATA_DIR)
      .filter((f) => f.endsWith('_quests.json'))

    if (files.length === 0) {
      console.log('⚠ No *_quests.json files found in /server/data')
      return
    }

    let totalImported = 0

    for (const file of files) {
      const fullPath = path.join(DATA_DIR, file)
      const worldKey = detectWorldKey(file)

      if (!worldKey) {
        console.warn(`⚠ Unknown world key for file ${file}. Skipping.`)
        continue
      }

      const raw = fs.readFileSync(fullPath, 'utf8')
      const quests = JSON.parse(raw)

      if (!Array.isArray(quests)) {
        console.warn(`⚠ File ${file} does not contain an array. Skipping.`)
        continue
      }

      console.log(`\n📘 Importing ${quests.length} quests from ${file} → world '${worldKey}'`)

      for (const q of quests) {
        try {
          const result = await importQuest(worldKey, q)
          if (result) {
            console.log(`   ✔ Imported: ${q.slug ?? q.questId}`)
            totalImported++
          }
        } catch (err: any) {
          console.error(`   ❌ Failed: ${q.slug ?? q.questId} → ${err.message}`)
        }
      }
    }

    console.log(`\n🎉 Import complete! Total imported/updated challenges: ${totalImported}`)
    process.exit(0)
  } catch (err: any) {
    console.error('❌ Import script failed:', err.message)
    process.exit(1)
  }
}

main()
