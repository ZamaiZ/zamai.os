import "server-only"

import { getGoogleMapsApiKey } from "@/lib/google/mapsConfig"
import { isPlaceTableAType } from "@/lib/prospects/segments"

export class CityNotFoundError extends Error {
  constructor() {
    super("City not found")
    this.name = "CityNotFoundError"
  }
}

export class GooglePlacesError extends Error {
  readonly googleStatus?: string

  constructor(message = "Google Places request failed", googleStatus?: string) {
    super(message)
    this.name = "GooglePlacesError"
    this.googleStatus = googleStatus
  }
}

export type GeocodedCity = {
  label: string
  viewport: {
    low: { latitude: number; longitude: number }
    high: { latitude: number; longitude: number }
  }
}

export type GooglePlaceResult = {
  id: string
  displayName: string
  formattedAddress: string
  nationalPhoneNumber: string | null
  internationalPhoneNumber: string | null
  websiteUri: string | null
  googleMapsUri: string | null
  primaryType: string | null
  types: string[]
  businessStatus: string | null
  rating: number | null
  userRatingCount: number | null
}

type GeocodeResponse = {
  status: string
  error_message?: string
  results?: Array<{
    formatted_address?: string
    geometry?: {
      viewport?: {
        southwest: { lat: number; lng: number }
        northeast: { lat: number; lng: number }
      }
    }
  }>
}

type PlacesSearchResponse = {
  places?: Array<{
    id?: string
    displayName?: { text?: string }
    formattedAddress?: string
    nationalPhoneNumber?: string
    internationalPhoneNumber?: string
    websiteUri?: string
    googleMapsUri?: string
    primaryType?: string
    types?: string[]
    businessStatus?: string
    rating?: number
    userRatingCount?: number
  }>
  nextPageToken?: string
  error?: { message?: string; status?: string }
}

const TEXT_SEARCH_URL = "https://places.googleapis.com/v1/places:searchText"
const GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json"
const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.nationalPhoneNumber",
  "places.internationalPhoneNumber",
  "places.websiteUri",
  "places.googleMapsUri",
  "places.primaryType",
  "places.types",
  "places.businessStatus",
  "places.rating",
  "places.userRatingCount",
  "nextPageToken",
].join(",")

const MAX_PAGES = 3

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function mapPlace(
  place: NonNullable<PlacesSearchResponse["places"]>[number]
): GooglePlaceResult | null {
  const id = place.id?.trim()
  const displayName = place.displayName?.text?.trim()
  const formattedAddress = place.formattedAddress?.trim()
  if (!id || !displayName || !formattedAddress) {
    return null
  }

  return {
    id,
    displayName,
    formattedAddress,
    nationalPhoneNumber: place.nationalPhoneNumber?.trim() || null,
    internationalPhoneNumber: place.internationalPhoneNumber?.trim() || null,
    websiteUri: place.websiteUri?.trim() || null,
    googleMapsUri: place.googleMapsUri?.trim() || null,
    primaryType: place.primaryType?.trim() || null,
    types: place.types ?? [],
    businessStatus: place.businessStatus?.trim() || null,
    rating: typeof place.rating === "number" ? place.rating : null,
    userRatingCount:
      typeof place.userRatingCount === "number" ? place.userRatingCount : null,
  }
}

export async function geocodeCity(cityQuery: string): Promise<GeocodedCity> {
  const apiKey = getGoogleMapsApiKey()
  const url = new URL(GEOCODE_URL)
  url.searchParams.set("address", cityQuery)
  url.searchParams.set("region", "br")
  url.searchParams.set("language", "pt-BR")
  url.searchParams.set("key", apiKey)

  const response = await fetch(url)
  const payload = (await response.json().catch(() => null)) as
    | GeocodeResponse
    | null

  if (!response.ok) {
    const message = payload?.error_message ?? "Unable to geocode city"
    console.error("Geocoding HTTP error", {
      httpStatus: response.status,
      googleStatus: payload?.status,
      message,
    })
    throw new GooglePlacesError(message, payload?.status)
  }

  if (!payload) {
    throw new GooglePlacesError("Unable to geocode city")
  }

  if (payload.status !== "OK" && payload.status !== "ZERO_RESULTS") {
    const message =
      payload.error_message ?? `Geocoding failed: ${payload.status}`
    console.error("Geocoding API error", {
      googleStatus: payload.status,
      message,
    })
    throw new GooglePlacesError(message, payload.status)
  }

  if (payload.status === "ZERO_RESULTS" || !payload.results?.length) {
    throw new CityNotFoundError()
  }

  const result = payload.results[0]
  const viewport = result?.geometry?.viewport
  const label = result?.formatted_address?.trim()
  if (!viewport || !label) {
    throw new CityNotFoundError()
  }

  return {
    label,
    viewport: {
      low: {
        latitude: viewport.southwest.lat,
        longitude: viewport.southwest.lng,
      },
      high: {
        latitude: viewport.northeast.lat,
        longitude: viewport.northeast.lng,
      },
    },
  }
}

async function searchTextPage(body: Record<string, unknown>) {
  const apiKey = getGoogleMapsApiKey()
  const response = await fetch(TEXT_SEARCH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": FIELD_MASK,
    },
    body: JSON.stringify(body),
  })

  const payload = (await response.json().catch(() => null)) as
    | PlacesSearchResponse
    | null

  if (!response.ok || payload?.error) {
    const googleStatus = payload?.error?.status
    const message = payload?.error?.message ?? "Google Places request failed"
    console.error("Places API error", {
      httpStatus: response.status,
      googleStatus,
      message,
    })
    throw new GooglePlacesError(message, googleStatus)
  }

  return payload ?? {}
}

export async function searchPlacesByCity(input: {
  textQuery: string
  includedType: string
  viewport: GeocodedCity["viewport"]
}): Promise<GooglePlaceResult[]> {
  if (!isPlaceTableAType(input.includedType)) {
    throw new GooglePlacesError(
      `Invalid includedType: ${input.includedType}`,
      "INVALID_ARGUMENT"
    )
  }

  const places: GooglePlaceResult[] = []
  let pageToken: string | undefined

  for (let page = 0; page < MAX_PAGES; page++) {
    const requestBody: Record<string, unknown> = {
      textQuery: input.textQuery,
      includedType: input.includedType,
      strictTypeFiltering: true,
      languageCode: "pt-BR",
      regionCode: "BR",
      pageSize: 20,
      locationRestriction: {
        rectangle: input.viewport,
      },
    }

    if (pageToken) {
      requestBody.pageToken = pageToken
    }

    let payload: PlacesSearchResponse = {}
    let attempts = 0
    while (attempts < 4) {
      try {
        payload = await searchTextPage(requestBody)
        break
      } catch (error) {
        const message = error instanceof Error ? error.message : ""
        const retryable =
          Boolean(pageToken) &&
          /pageToken|PAGE_TOKEN|INVALID_ARGUMENT/i.test(message)
        if (!retryable || attempts === 3) {
          throw error
        }
        await delay(1200)
        attempts += 1
      }
    }

    for (const place of payload.places ?? []) {
      const mapped = mapPlace(place)
      if (mapped) {
        places.push(mapped)
      }
    }

    pageToken = payload.nextPageToken?.trim() || undefined
    if (!pageToken) {
      break
    }
    await delay(300)
  }

  return places
}
