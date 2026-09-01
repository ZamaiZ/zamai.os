import type { SavableWebsiteKind } from "@/lib/prospects/websiteKind"
import type { ProspectStatus } from "@/lib/prospects/status"

export type { ProspectStatus }

export type ProspectCandidate = {
  googlePlaceId: string
  name: string
  formattedAddress: string
  phone: string | null
  websiteUri: string | null
  websiteKind: SavableWebsiteKind
  googleMapsUri: string | null
  primaryType: string | null
  types: string[]
  rating: number | null
  userRatingCount: number | null
  photoName: string | null
  alreadySaved: boolean
  nowHasOwnWebsite: boolean
}

export type ProspectSearchDto = {
  searchId: string
  geocodedLabel: string
  googleResultCount: number
  matchedCount: number
  candidates: ProspectCandidate[]
}

export type ProspectDto = {
  id: string
  googlePlaceId: string
  name: string
  formattedAddress: string
  phone: string | null
  websiteUri: string | null
  websiteKind: SavableWebsiteKind
  googleMapsUri: string | null
  primaryType: string | null
  types: string[]
  rating: number | null
  userRatingCount: number | null
  status: ProspectStatus
  lastFetchedAt: string
  createdAt: string
}

export type ProspectRow = {
  id: string
  google_place_id: string
  name: string
  formatted_address: string
  phone: string | null
  website_uri: string | null
  website_kind: string
  google_maps_uri: string | null
  primary_type: string | null
  types: unknown
  rating: number | null
  user_rating_count: number | null
  photo_name: string | null
  status: string
  source_search_id: string | null
  last_fetched_at: string
  created_at: string
  updated_at: string
}
