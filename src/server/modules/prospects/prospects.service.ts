import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"
import { checkRateLimit } from "@/lib/rateLimit"
import { getProspectSegmentLabel } from "@/lib/prospects/segments"
import { classifyWebsiteUri } from "@/lib/prospects/websiteKind"
import type { Json } from "@/lib/supabase/database.types"
import type { ProspectStatus } from "@/lib/prospects/status"

import {
  CityNotFoundError,
  GooglePlacesError,
  geocodeCity,
  searchPlacesByCity,
} from "./googlePlaces.client"
import type {
  ProspectCandidate,
  ProspectDto,
  ProspectRow,
  ProspectSearchDto,
} from "./prospects.types"

export class ProspectRateLimitedError extends Error {
  constructor() {
    super("Prospect search rate limited")
    this.name = "ProspectRateLimitedError"
  }
}

export class ProspectSearchNotFoundError extends Error {
  constructor() {
    super("Prospect search not found")
    this.name = "ProspectSearchNotFoundError"
  }
}

export class ProspectNotFoundError extends Error {
  constructor() {
    super("Prospect not found")
    this.name = "ProspectNotFoundError"
  }
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return []
  }
  return value.filter((item): item is string => typeof item === "string")
}

function toProspectDto(row: ProspectRow): ProspectDto {
  return {
    id: row.id,
    googlePlaceId: row.google_place_id,
    name: row.name,
    formattedAddress: row.formatted_address,
    phone: row.phone,
    websiteUri: row.website_uri,
    websiteKind:
      row.website_kind === "social" || row.website_kind === "aggregator"
        ? row.website_kind
        : "none",
    googleMapsUri: row.google_maps_uri,
    primaryType: row.primary_type,
    types: asStringArray(row.types),
    rating: row.rating,
    userRatingCount: row.user_rating_count,
    status: row.status as ProspectStatus,
    lastFetchedAt: row.last_fetched_at,
    createdAt: row.created_at,
  }
}

function parseCandidates(value: unknown): ProspectCandidate[] {
  if (!Array.isArray(value)) {
    return []
  }

  const candidates: ProspectCandidate[] = []
  for (const item of value) {
    if (!item || typeof item !== "object") {
      continue
    }
    const row = item as Record<string, unknown>
    const googlePlaceId =
      typeof row.googlePlaceId === "string" ? row.googlePlaceId : ""
    const name = typeof row.name === "string" ? row.name : ""
    const formattedAddress =
      typeof row.formattedAddress === "string" ? row.formattedAddress : ""
    const websiteKind = row.websiteKind
    if (
      !googlePlaceId ||
      !name ||
      !formattedAddress ||
      (websiteKind !== "none" &&
        websiteKind !== "social" &&
        websiteKind !== "aggregator")
    ) {
      continue
    }

    candidates.push({
      googlePlaceId,
      name,
      formattedAddress,
      phone: typeof row.phone === "string" ? row.phone : null,
      websiteUri: typeof row.websiteUri === "string" ? row.websiteUri : null,
      websiteKind,
      googleMapsUri:
        typeof row.googleMapsUri === "string" ? row.googleMapsUri : null,
      primaryType: typeof row.primaryType === "string" ? row.primaryType : null,
      types: asStringArray(row.types),
      rating: typeof row.rating === "number" ? row.rating : null,
      userRatingCount:
        typeof row.userRatingCount === "number" ? row.userRatingCount : null,
      photoName: typeof row.photoName === "string" ? row.photoName : null,
      alreadySaved: row.alreadySaved === true,
      nowHasOwnWebsite: row.nowHasOwnWebsite === true,
    })
  }

  return candidates
}

export class ProspectService {
  static async listProspects(options?: {
    status?: ProspectStatus | "all"
  }): Promise<ProspectDto[]> {
    const supabase = createAdminClient()
    let query = supabase
      .from("prospects")
      .select(
        "id, google_place_id, name, formatted_address, phone, website_uri, website_kind, google_maps_uri, primary_type, types, rating, user_rating_count, photo_name, status, source_search_id, last_fetched_at, created_at, updated_at"
      )
      .order("created_at", { ascending: false })

    const status = options?.status
    if (!status) {
      query = query.neq("status", "discarded")
    } else if (status !== "all") {
      query = query.eq("status", status)
    }

    const { data, error } = await query
    if (error) {
      throw new Error("Unable to list prospects", { cause: error })
    }

    return (data ?? []).map((row) => toProspectDto(row as ProspectRow))
  }

  static async searchProspects(input: {
    cityQuery: string
    includedType: string
    userId: string
  }): Promise<ProspectSearchDto> {
    const allowed = await checkRateLimit("prospects-search", input.userId)
    if (!allowed) {
      throw new ProspectRateLimitedError()
    }

    const geocoded = await geocodeCity(input.cityQuery)
    const segmentLabel = getProspectSegmentLabel(input.includedType)
    const places = await searchPlacesByCity({
      textQuery: `${segmentLabel} em ${input.cityQuery}`,
      includedType: input.includedType,
      viewport: geocoded.viewport,
    })

    const supabase = createAdminClient()
    const { data: existingRows, error: existingError } = await supabase
      .from("prospects")
      .select("google_place_id")

    if (existingError) {
      throw new Error("Unable to load saved prospects", { cause: existingError })
    }

    const savedIds = new Set(
      (existingRows ?? []).map((row) => row.google_place_id)
    )

    const candidates: ProspectCandidate[] = []
    let matchedCount = 0

    for (const place of places) {
      if (place.businessStatus === "CLOSED_PERMANENTLY") {
        continue
      }

      const websiteKind = classifyWebsiteUri(place.websiteUri)
      const alreadySaved = savedIds.has(place.id)
      const phone =
        place.nationalPhoneNumber ?? place.internationalPhoneNumber

      if (websiteKind === "own") {
        if (alreadySaved) {
          candidates.push({
            googlePlaceId: place.id,
            name: place.displayName,
            formattedAddress: place.formattedAddress,
            phone,
            websiteUri: place.websiteUri,
            websiteKind: "none",
            googleMapsUri: place.googleMapsUri,
            primaryType: place.primaryType,
            types: place.types,
            rating: place.rating,
            userRatingCount: place.userRatingCount,
            photoName: null,
            alreadySaved: true,
            nowHasOwnWebsite: true,
          })
        }
        continue
      }

      matchedCount += 1
      candidates.push({
        googlePlaceId: place.id,
        name: place.displayName,
        formattedAddress: place.formattedAddress,
        phone,
        websiteUri: place.websiteUri,
        websiteKind,
        googleMapsUri: place.googleMapsUri,
        primaryType: place.primaryType,
        types: place.types,
        rating: place.rating,
        userRatingCount: place.userRatingCount,
        photoName: null,
        alreadySaved,
        nowHasOwnWebsite: false,
      })
    }

    const { data: searchRow, error: insertError } = await supabase
      .from("prospect_searches")
      .insert({
        city_query: input.cityQuery,
        geocoded_label: geocoded.label,
        included_type: input.includedType,
        viewport: geocoded.viewport as unknown as Json,
        google_result_count: places.length,
        matched_count: matchedCount,
        candidates: candidates as unknown as Json,
      })
      .select("id")
      .single()

    if (insertError || !searchRow) {
      throw new Error("Unable to save prospect search", { cause: insertError })
    }

    return {
      searchId: searchRow.id,
      geocodedLabel: geocoded.label,
      googleResultCount: places.length,
      matchedCount,
      candidates,
    }
  }

  static async saveProspects(input: {
    searchId: string
    googlePlaceIds: string[]
  }): Promise<ProspectDto[]> {
    const uniqueIds = [...new Set(input.googlePlaceIds)]
    const supabase = createAdminClient()
    const { data: searchRow, error: searchError } = await supabase
      .from("prospect_searches")
      .select("id, candidates")
      .eq("id", input.searchId)
      .maybeSingle()

    if (searchError) {
      throw new Error("Unable to load prospect search", { cause: searchError })
    }
    if (!searchRow) {
      throw new ProspectSearchNotFoundError()
    }

    const candidates = parseCandidates(searchRow.candidates)
    const byId = new Map(
      candidates.map((candidate) => [candidate.googlePlaceId, candidate])
    )

    const toInsert = uniqueIds
      .map((id) => byId.get(id))
      .filter((candidate): candidate is ProspectCandidate => {
        if (!candidate) {
          return false
        }
        return !candidate.alreadySaved && !candidate.nowHasOwnWebsite
      })

    if (toInsert.length === 0) {
      return []
    }

    const { data: existingRows, error: existingError } = await supabase
      .from("prospects")
      .select("google_place_id")
      .in(
        "google_place_id",
        toInsert.map((candidate) => candidate.googlePlaceId)
      )

    if (existingError) {
      throw new Error("Unable to check saved prospects", {
        cause: existingError,
      })
    }

    const already = new Set(
      (existingRows ?? []).map((row) => row.google_place_id)
    )
    const rows = toInsert
      .filter((candidate) => !already.has(candidate.googlePlaceId))
      .map((candidate) => ({
        google_place_id: candidate.googlePlaceId,
        name: candidate.name,
        formatted_address: candidate.formattedAddress,
        phone: candidate.phone,
        website_uri: candidate.websiteUri,
        website_kind: candidate.websiteKind,
        google_maps_uri: candidate.googleMapsUri,
        primary_type: candidate.primaryType,
        types: candidate.types as unknown as Json,
        rating: candidate.rating,
        user_rating_count: candidate.userRatingCount,
        photo_name: candidate.photoName,
        status: "prospect" as const,
        source_search_id: input.searchId,
        last_fetched_at: new Date().toISOString(),
      }))

    if (rows.length === 0) {
      return []
    }

    const { data, error } = await supabase
      .from("prospects")
      .insert(rows)
      .select(
        "id, google_place_id, name, formatted_address, phone, website_uri, website_kind, google_maps_uri, primary_type, types, rating, user_rating_count, photo_name, status, source_search_id, last_fetched_at, created_at, updated_at"
      )

    if (error) {
      throw new Error("Unable to save prospects", { cause: error })
    }

    return (data ?? []).map((row) => toProspectDto(row as ProspectRow))
  }

  static async updateProspectStatus(input: {
    id: string
    status: ProspectStatus
  }): Promise<ProspectDto> {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("prospects")
      .update({
        status: input.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", input.id)
      .select(
        "id, google_place_id, name, formatted_address, phone, website_uri, website_kind, google_maps_uri, primary_type, types, rating, user_rating_count, photo_name, status, source_search_id, last_fetched_at, created_at, updated_at"
      )
      .maybeSingle()

    if (error) {
      throw new Error("Unable to update prospect", { cause: error })
    }
    if (!data) {
      throw new ProspectNotFoundError()
    }

    return toProspectDto(data as ProspectRow)
  }
}

export { CityNotFoundError, GooglePlacesError }
