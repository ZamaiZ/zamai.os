import { createClient } from "@supabase/supabase-js"
import { existsSync, readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { optimize } from "svgo"

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = join(__dirname, "..")
const iconsDir = join(rootDir, "data", "muscle-group-icons")

/** @type {Record<string, string>} slug -> filename without .svg */
const SLUG_TO_ICON = {
  biceps: "biceps",
  triceps: "triceps",
  costas: "back",
  ombro: "shoulders",
  peito: "chest",
  quadriceps: "quadriceps",
  panturrilha: "calf",
  posterior_gluteo: "glutes",
}

const MAX_CHARS = 32_768

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

/**
 * @param {string} raw
 */
function processIconSvg(raw) {
  const input = raw.trim()
  if (!input || !/<svg[\s>]/i.test(input)) {
    throw new Error("Invalid SVG")
  }

  const optimized = optimize(input, {
    multipass: true,
    plugins: [
      "preset-default",
      {
        name: "removeAttrs",
        params: { attrs: "(width|height)" },
      },
      {
        name: "convertColors",
        params: { currentColor: true },
      },
    ],
  })

  let svg = optimized.data
  svg = svg.replace(/\s(fill|stroke)\s*=\s*(["'])(?!none|currentColor|transparent)(.*?)\2/gi, ' $1=$2currentColor$2')
  if (!/\saria-hidden\s*=/i.test(svg)) {
    svg = svg.replace(/<svg\b/i, '<svg aria-hidden="true"')
  }
  if (!/\sviewBox\s*=/i.test(svg)) {
    svg = svg.replace(/<svg\b/i, '<svg viewBox="0 0 64 64"')
  }
  svg = svg.replace(/\s{2,}/g, " ").replace(/>\s+</g, "><").trim()

  if (svg.length > MAX_CHARS) {
    throw new Error(`SVG exceeds ${MAX_CHARS} chars after optimize`)
  }

  return svg
}

async function main() {
  loadDotEnv()

  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL")
  const secretKey = requireEnv("SUPABASE_SECRET_KEY")
  const supabase = createClient(url, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  for (const [slug, iconName] of Object.entries(SLUG_TO_ICON)) {
    const filePath = join(iconsDir, `${iconName}.svg`)
    if (!existsSync(filePath)) {
      throw new Error(`Missing icon file: ${filePath}`)
    }

    const iconSvg = processIconSvg(readFileSync(filePath, "utf8"))
    const { error } = await supabase
      .from("muscle_groups")
      .update({ icon_svg: iconSvg })
      .eq("slug", slug)

    if (error) {
      throw new Error(`Failed to update ${slug}: ${error.message}`)
    }

    console.log(`Updated ${slug} ← ${iconName}.svg (${iconSvg.length} chars)`)
  }

  const fallbackPath = join(iconsDir, "muscle.svg")
  if (!existsSync(fallbackPath)) {
    throw new Error(`Missing icon file: ${fallbackPath}`)
  }

  const fallbackSvg = processIconSvg(readFileSync(fallbackPath, "utf8"))
  const { data: filled, error: fallbackError } = await supabase
    .from("muscle_groups")
    .update({ icon_svg: fallbackSvg })
    .is("icon_svg", null)
    .select("slug")

  if (fallbackError) {
    throw new Error(`Failed to apply muscle.svg fallback: ${fallbackError.message}`)
  }

  const filledSlugs = (filled ?? []).map((row) => row.slug)
  if (filledSlugs.length === 0) {
    console.log("No groups with null icon_svg; muscle.svg fallback unused.")
  } else {
    console.log(
      `Fallback muscle.svg → ${filledSlugs.join(", ")} (${fallbackSvg.length} chars)`
    )
  }

  console.log("Done.")
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
