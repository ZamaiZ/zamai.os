import type {
  CatalogCandidate,
  CatalogProspect,
  StatusFilter,
} from "./types"

export function isSelectableCandidate(candidate: CatalogCandidate) {
  return !candidate.alreadySaved && !candidate.nowHasOwnWebsite
}

export function matchesStatusFilter(
  prospect: CatalogProspect,
  filter: StatusFilter
) {
  if (filter === "all") return true
  if (filter === "active") return prospect.status !== "discarded"
  return prospect.status === filter
}

export function countByStatusFilter(
  prospects: CatalogProspect[],
  filter: StatusFilter
) {
  return prospects.filter((prospect) => matchesStatusFilter(prospect, filter))
    .length
}
