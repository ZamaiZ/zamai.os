import type { ProspectStatus } from "@/lib/prospects/status"
import type { SavableWebsiteKind } from "@/lib/prospects/websiteKind"

export type CatalogProspect = {
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

export type CatalogCandidate = {
  googlePlaceId: string
  name: string
  formattedAddress: string
  phone: string | null
  websiteUri: string | null
  websiteKind: SavableWebsiteKind
  googleMapsUri: string | null
  primaryType: string | null
  alreadySaved: boolean
  nowHasOwnWebsite: boolean
}

export type CatalogSearch = {
  searchId: string
  geocodedLabel: string
  googleResultCount: number
  matchedCount: number
  candidates: CatalogCandidate[]
}

export type ClientsCatalogProps = {
  prospects: CatalogProspect[]
}

export type StatusFilter = ProspectStatus | "active" | "all"

export const STATUS_FILTERS: StatusFilter[] = [
  "active",
  "all",
  "prospect",
  "contacted",
  "client",
  "discarded",
]
