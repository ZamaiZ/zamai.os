import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"
import { getSupabasePublicConfig } from "@/lib/supabase/config"

import type {
  ExerciseDto,
  ExerciseRow,
  MuscleGroupDto,
  MuscleGroupRow,
} from "./exercises.types"
import { processMuscleGroupIconSvg } from "./muscleGroupIcon.pipeline"

const BUCKET = "exercise-media"

type ExerciseWithGroup = ExerciseRow & {
  muscle_groups: Pick<MuscleGroupRow, "id" | "slug" | "name"> | null
}

function publicObjectUrl(objectPath: string | null): string | null {
  if (!objectPath) {
    return null
  }

  const { url } = getSupabasePublicConfig()
  return `${url}/storage/v1/object/public/${BUCKET}/${objectPath}`
}

function toExerciseDto(row: ExerciseWithGroup): ExerciseDto {
  const group = row.muscle_groups
  if (!group) {
    throw new Error("Exercise is missing muscle group relation")
  }

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    muscleGroup: {
      id: group.id,
      slug: group.slug,
      name: group.name,
    },
    sourceExerciseId: row.source_exercise_id,
    sourceName: row.source_name,
    equipment: row.equipment,
    target: row.target,
    thumbnailUrl: publicObjectUrl(row.thumbnail_path),
    gifUrl: publicObjectUrl(row.gif_path),
  }
}

export class ExerciseService {
  static async listMuscleGroups(): Promise<MuscleGroupDto[]> {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("muscle_groups")
      .select("id, slug, name, sort_order, icon_svg, created_at")
      .order("sort_order", { ascending: true })

    if (error) {
      throw new Error("Unable to list muscle groups", { cause: error })
    }

    return (data ?? []).map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      sortOrder: row.sort_order,
      iconSvg: row.icon_svg,
    }))
  }

  static async listExercises(options?: {
    muscleGroupSlug?: string
  }): Promise<ExerciseDto[]> {
    const supabase = createAdminClient()

    let query = supabase
      .from("exercises")
      .select(
        "id, muscle_group_id, name, slug, source_exercise_id, source_name, equipment, target, thumbnail_path, gif_path, created_at, updated_at, muscle_groups!inner(id, slug, name)"
      )
      .order("name", { ascending: true })

    if (options?.muscleGroupSlug) {
      query = query.eq("muscle_groups.slug", options.muscleGroupSlug)
    }

    const { data, error } = await query

    if (error) {
      throw new Error("Unable to list exercises", { cause: error })
    }

    return ((data ?? []) as ExerciseWithGroup[]).map(toExerciseDto)
  }

  static async getExerciseById(id: string): Promise<ExerciseDto | null> {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("exercises")
      .select(
        "id, muscle_group_id, name, slug, source_exercise_id, source_name, equipment, target, thumbnail_path, gif_path, created_at, updated_at, muscle_groups(id, slug, name)"
      )
      .eq("id", id)
      .maybeSingle()

    if (error) {
      throw new Error("Unable to get exercise", { cause: error })
    }

    if (!data) {
      return null
    }

    return toExerciseDto(data as ExerciseWithGroup)
  }

  static async createMuscleGroup(input: {
    name: string
    iconSvgRaw: string
  }): Promise<MuscleGroupDto> {
    const name = input.name.trim()
    if (!name || name.length > 80) {
      throw new Error("Muscle group name must be between 1 and 80 characters")
    }

    const slug = toMuscleGroupSlug(name)
    if (!slug) {
      throw new Error("Unable to derive slug from muscle group name")
    }

    const iconSvg = processMuscleGroupIconSvg(input.iconSvgRaw)
    const supabase = createAdminClient()

    const { data: existing, error: existingError } = await supabase
      .from("muscle_groups")
      .select("id")
      .eq("slug", slug)
      .maybeSingle()

    if (existingError) {
      throw new Error("Unable to check muscle group slug", {
        cause: existingError,
      })
    }

    if (existing) {
      throw new Error("A muscle group with this name already exists")
    }

    const { data: maxRow, error: maxError } = await supabase
      .from("muscle_groups")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (maxError) {
      throw new Error("Unable to resolve sort order", { cause: maxError })
    }

    const sortOrder = (maxRow?.sort_order ?? 0) + 10

    const { data, error } = await supabase
      .from("muscle_groups")
      .insert({
        name,
        slug,
        sort_order: sortOrder,
        icon_svg: iconSvg,
      })
      .select("id, slug, name, sort_order, icon_svg, created_at")
      .single()

    if (error || !data) {
      throw new Error("Unable to create muscle group", { cause: error })
    }

    return {
      id: data.id,
      slug: data.slug,
      name: data.name,
      sortOrder: data.sort_order,
      iconSvg: data.icon_svg,
    }
  }

  static async updateMuscleGroup(input: {
    id: string
    name: string
    iconSvgRaw: string
  }): Promise<MuscleGroupDto> {
    const name = input.name.trim()
    if (!name || name.length > 80) {
      throw new Error("Muscle group name must be between 1 and 80 characters")
    }

    const slug = toMuscleGroupSlug(name)
    if (!slug) {
      throw new Error("Unable to derive slug from muscle group name")
    }

    const iconSvg = processMuscleGroupIconSvg(input.iconSvgRaw)
    const supabase = createAdminClient()

    const { data: current, error: currentError } = await supabase
      .from("muscle_groups")
      .select("id")
      .eq("id", input.id)
      .maybeSingle()

    if (currentError) {
      throw new Error("Unable to load muscle group", { cause: currentError })
    }

    if (!current) {
      throw new Error("Muscle group not found")
    }

    const { data: existing, error: existingError } = await supabase
      .from("muscle_groups")
      .select("id")
      .eq("slug", slug)
      .neq("id", input.id)
      .maybeSingle()

    if (existingError) {
      throw new Error("Unable to check muscle group slug", {
        cause: existingError,
      })
    }

    if (existing) {
      throw new Error("A muscle group with this name already exists")
    }

    const { data, error } = await supabase
      .from("muscle_groups")
      .update({
        name,
        slug,
        icon_svg: iconSvg,
      })
      .eq("id", input.id)
      .select("id, slug, name, sort_order, icon_svg, created_at")
      .single()

    if (error || !data) {
      throw new Error("Unable to update muscle group", { cause: error })
    }

    return {
      id: data.id,
      slug: data.slug,
      name: data.name,
      sortOrder: data.sort_order,
      iconSvg: data.icon_svg,
    }
  }

  static async createExercise(input: {
    name: string
    muscleGroupId: string
    equipment?: string
    gif: Buffer
    thumbnail: Buffer
  }): Promise<ExerciseDto> {
    const name = input.name.trim()
    if (!name || name.length > 120) {
      throw new Error("Exercise name must be between 1 and 120 characters")
    }

    const slug = toExerciseSlug(name)
    if (!slug) {
      throw new Error("Unable to derive slug from exercise name")
    }

    const equipment = normalizeEquipment(input.equipment)
    const supabase = createAdminClient()

    const { data: group, error: groupError } = await supabase
      .from("muscle_groups")
      .select("id")
      .eq("id", input.muscleGroupId)
      .maybeSingle()

    if (groupError) {
      throw new Error("Unable to load muscle group", { cause: groupError })
    }
    if (!group) {
      throw new Error("Muscle group not found")
    }

    const { data: existing, error: existingError } = await supabase
      .from("exercises")
      .select("id")
      .eq("slug", slug)
      .maybeSingle()

    if (existingError) {
      throw new Error("Unable to check exercise slug", {
        cause: existingError,
      })
    }
    if (existing) {
      throw new Error("An exercise with this name already exists")
    }

    const id = crypto.randomUUID()
    const gifPath = `gifs/${id}.gif`
    const thumbnailPath = `thumbnails/${id}.jpg`

    await uploadExerciseMedia(supabase, gifPath, input.gif, "image/gif")
    await uploadExerciseMedia(
      supabase,
      thumbnailPath,
      input.thumbnail,
      "image/jpeg"
    )

    const { data, error } = await supabase
      .from("exercises")
      .insert({
        id,
        name,
        slug,
        muscle_group_id: input.muscleGroupId,
        equipment,
        source_exercise_id: null,
        source_name: null,
        gif_path: gifPath,
        thumbnail_path: thumbnailPath,
      })
      .select(
        "id, muscle_group_id, name, slug, source_exercise_id, source_name, equipment, target, thumbnail_path, gif_path, created_at, updated_at, muscle_groups(id, slug, name)"
      )
      .single()

    if (error || !data) {
      throw new Error("Unable to create exercise", { cause: error })
    }

    return toExerciseDto(data as ExerciseWithGroup)
  }

  static async updateExercise(input: {
    id: string
    name: string
    muscleGroupId: string
    equipment?: string
    gif?: Buffer
    thumbnail?: Buffer
  }): Promise<ExerciseDto> {
    const name = input.name.trim()
    if (!name || name.length > 120) {
      throw new Error("Exercise name must be between 1 and 120 characters")
    }

    const slug = toExerciseSlug(name)
    if (!slug) {
      throw new Error("Unable to derive slug from exercise name")
    }

    if ((input.gif && !input.thumbnail) || (!input.gif && input.thumbnail)) {
      throw new Error("Invalid media: gif and thumbnail must be sent together")
    }

    const equipment = normalizeEquipment(input.equipment)
    const supabase = createAdminClient()

    const { data: current, error: currentError } = await supabase
      .from("exercises")
      .select("id")
      .eq("id", input.id)
      .maybeSingle()

    if (currentError) {
      throw new Error("Unable to load exercise", { cause: currentError })
    }
    if (!current) {
      throw new Error("Exercise not found")
    }

    const { data: group, error: groupError } = await supabase
      .from("muscle_groups")
      .select("id")
      .eq("id", input.muscleGroupId)
      .maybeSingle()

    if (groupError) {
      throw new Error("Unable to load muscle group", { cause: groupError })
    }
    if (!group) {
      throw new Error("Muscle group not found")
    }

    const { data: existing, error: existingError } = await supabase
      .from("exercises")
      .select("id")
      .eq("slug", slug)
      .neq("id", input.id)
      .maybeSingle()

    if (existingError) {
      throw new Error("Unable to check exercise slug", {
        cause: existingError,
      })
    }
    if (existing) {
      throw new Error("An exercise with this name already exists")
    }

    const gifPath = `gifs/${input.id}.gif`
    const thumbnailPath = `thumbnails/${input.id}.jpg`

    if (input.gif && input.thumbnail) {
      await uploadExerciseMedia(supabase, gifPath, input.gif, "image/gif")
      await uploadExerciseMedia(
        supabase,
        thumbnailPath,
        input.thumbnail,
        "image/jpeg"
      )
    }

    const { data, error } = await supabase
      .from("exercises")
      .update(
        input.gif && input.thumbnail
          ? {
              name,
              slug,
              muscle_group_id: input.muscleGroupId,
              equipment,
              gif_path: gifPath,
              thumbnail_path: thumbnailPath,
              updated_at: new Date().toISOString(),
            }
          : {
              name,
              slug,
              muscle_group_id: input.muscleGroupId,
              equipment,
              updated_at: new Date().toISOString(),
            }
      )
      .eq("id", input.id)
      .select(
        "id, muscle_group_id, name, slug, source_exercise_id, source_name, equipment, target, thumbnail_path, gif_path, created_at, updated_at, muscle_groups(id, slug, name)"
      )
      .single()

    if (error || !data) {
      throw new Error("Unable to update exercise", { cause: error })
    }

    return toExerciseDto(data as ExerciseWithGroup)
  }
}

function normalizeEquipment(value: string | undefined): string | null {
  const trimmed = value?.trim()
  if (!trimmed) return null
  if (trimmed.length > 80) {
    throw new Error("Equipment must be at most 80 characters")
  }
  return trimmed
}

async function uploadExerciseMedia(
  supabase: ReturnType<typeof createAdminClient>,
  objectPath: string,
  body: Buffer,
  contentType: string
) {
  const { error } = await supabase.storage.from(BUCKET).upload(objectPath, body, {
    contentType,
    upsert: true,
  })

  if (error) {
    throw new Error("Unable to upload exercise media", { cause: error })
  }
}

function toExerciseSlug(name: string): string {
  return name
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function toMuscleGroupSlug(name: string): string {
  return name
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
}
