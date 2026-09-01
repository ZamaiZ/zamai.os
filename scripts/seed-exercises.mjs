import { createClient } from "@supabase/supabase-js"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = join(__dirname, "..")
const mappingPath = join(rootDir, "data", "exercises", "mapping.json")
const cacheDir = join(rootDir, "data", "exercises", ".cache")
const datasetCachePath = join(cacheDir, "exercises.json")
const DATASET_URL =
  "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/data/exercises.json"
const MEDIA_BASE =
  "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main"
const BUCKET = "exercise-media"

/**
 * @typedef {{ name: string, muscle_group: string, source_exercise_id: string | null }} MappingExercise
 * @typedef {{ exercises: MappingExercise[] }} MappingFile
 * @typedef {{
 *   id: string
 *   name: string
 *   equipment: string
 *   target: string
 *   image: string
 *   gif_url: string
 * }} DatasetExercise
 */

function loadDotEnv() {
  const envPath = join(rootDir, ".env")
  if (!existsSync(envPath)) {
    return
  }

  const lines = readFileSync(envPath, "utf8").split(/\r?\n/)
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) {
      continue
    }

    const eq = trimmed.indexOf("=")
    if (eq <= 0) {
      continue
    }

    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    if (!(key in process.env)) {
      process.env[key] = value
    }
  }
}

function requireEnv(name) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

function toSlug(name) {
  return name
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

/**
 * @param {string} url
 * @param {string} destPath
 */
async function downloadFile(url, destPath) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status}`)
  }

  const buffer = Buffer.from(await response.arrayBuffer())
  mkdirSync(dirname(destPath), { recursive: true })
  writeFileSync(destPath, buffer)
  return buffer
}

/**
 * @returns {Promise<DatasetExercise[]>}
 */
async function loadDataset() {
  mkdirSync(cacheDir, { recursive: true })

  if (!existsSync(datasetCachePath)) {
    console.log("Downloading exercises dataset…")
    await downloadFile(DATASET_URL, datasetCachePath)
  }

  return JSON.parse(readFileSync(datasetCachePath, "utf8"))
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} objectPath
 * @param {Buffer} body
 * @param {string} contentType
 */
async function uploadMedia(supabase, objectPath, body, contentType) {
  const { error } = await supabase.storage.from(BUCKET).upload(objectPath, body, {
    contentType,
    upsert: true,
  })

  if (error) {
    throw new Error(`Storage upload failed for ${objectPath}: ${error.message}`)
  }
}

async function main() {
  loadDotEnv()

  const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL")
  const secretKey = requireEnv("SUPABASE_SECRET_KEY")

  /** @type {MappingFile} */
  const mapping = JSON.parse(readFileSync(mappingPath, "utf8"))
  const dataset = await loadDataset()
  /** @type {Map<string, DatasetExercise>} */
  const byId = new Map(dataset.map((item) => [item.id, item]))

  const supabase = createClient(supabaseUrl, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data: groups, error: groupsError } = await supabase
    .from("muscle_groups")
    .select("id, slug")

  if (groupsError || !groups) {
    throw new Error(`Unable to load muscle_groups: ${groupsError?.message}`)
  }

  /** @type {Map<string, string>} */
  const groupIdBySlug = new Map(groups.map((g) => [g.slug, g.id]))

  let seeded = 0
  let skipped = 0

  for (const entry of mapping.exercises) {
    if (!entry.name || entry.name.trim().toUpperCase() === "N/A") {
      skipped += 1
      continue
    }

    const muscleGroupId = groupIdBySlug.get(entry.muscle_group)
    if (!muscleGroupId) {
      throw new Error(
        `Unknown muscle_group slug "${entry.muscle_group}" for "${entry.name}"`
      )
    }

    const slug = toSlug(entry.name)
    if (!slug) {
      throw new Error(`Unable to derive slug for "${entry.name}"`)
    }

    /** @type {Record<string, unknown>} */
    const row = {
      muscle_group_id: muscleGroupId,
      name: entry.name,
      slug,
      source_exercise_id: null,
      source_name: null,
      equipment: null,
      target: null,
      thumbnail_path: null,
      gif_path: null,
      updated_at: new Date().toISOString(),
    }

    if (entry.source_exercise_id) {
      const source = byId.get(entry.source_exercise_id)
      if (!source) {
        throw new Error(
          `Dataset id ${entry.source_exercise_id} not found for "${entry.name}"`
        )
      }

      const thumbPath = `thumbnails/${source.id}.jpg`
      const gifPath = `gifs/${source.id}.gif`
      const thumbCache = join(cacheDir, "media", `${source.id}.jpg`)
      const gifCache = join(cacheDir, "media", `${source.id}.gif`)

      const thumbBuffer = existsSync(thumbCache)
        ? readFileSync(thumbCache)
        : await downloadFile(`${MEDIA_BASE}/${source.image}`, thumbCache)

      const gifBuffer = existsSync(gifCache)
        ? readFileSync(gifCache)
        : await downloadFile(`${MEDIA_BASE}/${source.gif_url}`, gifCache)

      await uploadMedia(supabase, thumbPath, thumbBuffer, "image/jpeg")
      await uploadMedia(supabase, gifPath, gifBuffer, "image/gif")

      row.source_exercise_id = source.id
      row.source_name = source.name
      row.equipment = source.equipment
      row.target = source.target
      row.thumbnail_path = thumbPath
      row.gif_path = gifPath
    }

    const { error: upsertError } = await supabase.from("exercises").upsert(row, {
      onConflict: "slug",
    })

    if (upsertError) {
      throw new Error(
        `Upsert failed for "${entry.name}": ${upsertError.message}`
      )
    }

    seeded += 1
    console.log(`Seeded: ${entry.name}`)
  }

  console.log(`Done. Seeded ${seeded}, skipped ${skipped}.`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
