import { json, badRequest } from "@/server/http/response"
import type { ApiHandler } from "@/server/http/types"
import {
  listProspectsQuerySchema,
  prospectIdParamSchema,
  saveProspectsSchema,
  searchProspectsSchema,
  updateProspectStatusSchema,
  type SaveProspectsInput,
  type SearchProspectsInput,
  type UpdateProspectStatusInput,
} from "@/lib/validations/prospects"

import {
  CityNotFoundError,
  GooglePlacesError,
  ProspectNotFoundError,
  ProspectRateLimitedError,
  ProspectSearchNotFoundError,
  ProspectService,
} from "./prospects.service"

function mapSearchError(error: unknown) {
  if (error instanceof ProspectRateLimitedError) {
    return json({ error: "Rate limited" }, { status: 429 })
  }
  if (error instanceof CityNotFoundError) {
    return json({ error: "City not found" }, { status: 400 })
  }
  if (error instanceof GooglePlacesError) {
    if (
      error.googleStatus === "PERMISSION_DENIED" ||
      error.googleStatus === "REQUEST_DENIED"
    ) {
      return json(
        {
          error:
            "Geocoding não basta: ative a Places API (New) no mesmo projeto da chave.",
        },
        { status: 502 }
      )
    }
    if (error.googleStatus === "INVALID_ARGUMENT") {
      return json(
        { error: "Segmento inválido para a Places API." },
        { status: 400 }
      )
    }
    const detail = error.message.trim()
    return json(
      {
        error:
          detail && detail !== "Google Places request failed"
            ? `Não foi possível consultar o Google Maps agora. ${detail}`
            : "Não foi possível consultar o Google Maps agora.",
      },
      { status: 502 }
    )
  }
  throw error
}

export const listProspectsHandler: ApiHandler = async (ctx) => {
  const url = new URL(ctx.request.url)
  const parsed = listProspectsQuerySchema.safeParse({
    status: url.searchParams.get("status") ?? undefined,
  })

  if (!parsed.success) {
    return json({ error: "Invalid query" }, { status: 400 })
  }

  const prospects = await ProspectService.listProspects({
    status: parsed.data.status,
  })
  return json({ prospects })
}

export const searchProspectsHandler: ApiHandler = async (ctx) => {
  const body = ctx.body as SearchProspectsInput
  try {
    const result = await ProspectService.searchProspects({
      cityQuery: body.cityQuery,
      segmentId: body.segmentId,
      userId: ctx.user!.id,
    })
    return json(result)
  } catch (error) {
    return mapSearchError(error)
  }
}

export const saveProspectsHandler: ApiHandler = async (ctx) => {
  const body = ctx.body as SaveProspectsInput
  try {
    const prospects = await ProspectService.saveProspects({
      searchId: body.searchId,
      googlePlaceIds: body.googlePlaceIds,
    })
    return json({ prospects }, { status: 201 })
  } catch (error) {
    if (error instanceof ProspectSearchNotFoundError) {
      return json({ error: "Search not found" }, { status: 404 })
    }
    throw error
  }
}

export const updateProspectStatusHandler: ApiHandler = async (ctx) => {
  const parsedId = prospectIdParamSchema.safeParse({ id: ctx.params.id })
  if (!parsedId.success) {
    return badRequest("Invalid prospect id")
  }

  const body = ctx.body as UpdateProspectStatusInput
  try {
    const prospect = await ProspectService.updateProspectStatus({
      id: parsedId.data.id,
      status: body.status,
    })
    return json({ prospect })
  } catch (error) {
    if (error instanceof ProspectNotFoundError) {
      return json({ error: "Not found" }, { status: 404 })
    }
    throw error
  }
}
