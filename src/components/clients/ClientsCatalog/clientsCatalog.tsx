"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import {
  saveProspectsAction,
  searchProspectsAction,
  updateProspectStatusAction,
} from "@/app/actions/prospects"
import { ClientsSavedSection } from "@/components/clients/ClientsSavedSection"
import { ClientsSearchBar } from "@/components/clients/ClientsSearchBar"
import { ClientsSearchBatch } from "@/components/clients/ClientsSearchBatch"
import { clientsCatalogCopy } from "@/components/clients/shared/constants"
import {
  isSelectableCandidate,
  matchesStatusFilter,
} from "@/components/clients/shared/filterProspects"
import type {
  CatalogProspect,
  CatalogSearch,
  ClientsCatalogProps,
  StatusFilter,
} from "@/components/clients/shared/types"
import { toast } from "@/components/primitives/toast"
import { PROSPECT_SEGMENTS } from "@/lib/prospects/segments"
import type { ProspectStatus } from "@/lib/prospects/status"

export function ClientsCatalog({
  prospects: initialProspects,
}: ClientsCatalogProps) {
  const router = useRouter()
  const [cityQuery, setCityQuery] = React.useState("")
  const [segment, setSegment] = React.useState<
    (typeof PROSPECT_SEGMENTS)[number] | null
  >(null)
  const [searching, startSearch] = React.useTransition()
  const [saving, startSave] = React.useTransition()
  const [statusPendingId, setStatusPendingId] = React.useState<string | null>(
    null
  )
  const [search, setSearch] = React.useState<CatalogSearch | null>(null)
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())
  const [prospects, setProspects] =
    React.useState<CatalogProspect[]>(initialProspects)
  const [statusFilter, setStatusFilter] =
    React.useState<StatusFilter>("active")

  React.useEffect(() => {
    setProspects(initialProspects)
  }, [initialProspects])

  const visibleProspects = React.useMemo(
    () =>
      prospects.filter((prospect) =>
        matchesStatusFilter(prospect, statusFilter)
      ),
    [prospects, statusFilter]
  )

  function handleSearch(event: React.FormEvent) {
    event.preventDefault()
    if (!segment) {
      toast.add({
        type: "error",
        title: clientsCatalogCopy.segmentLabel,
        description: "Escolha um segmento.",
      })
      return
    }

    setSearch(null)
    startSearch(async () => {
      const result = await searchProspectsAction({
        cityQuery,
        segmentId: segment.id,
      })
      if (!result.ok) {
        toast.add({ type: "error", title: result.error })
        return
      }

      const next = result.search
      setSearch(next)
      setSelectedIds(
        new Set(
          next.candidates
            .filter(isSelectableCandidate)
            .map((candidate) => candidate.googlePlaceId)
        )
      )
    })
  }

  function toggleCandidate(id: string, checked: boolean) {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (checked) {
        next.add(id)
      } else {
        next.delete(id)
      }
      return next
    })
  }

  function handleSave() {
    if (!search) return
    const ids = [...selectedIds]
    if (ids.length === 0) {
      toast.add({ type: "info", title: clientsCatalogCopy.noneSelected })
      return
    }

    startSave(async () => {
      const result = await saveProspectsAction({
        searchId: search.searchId,
        googlePlaceIds: ids,
      })
      if (!result.ok) {
        toast.add({ type: "error", title: result.error })
        return
      }

      toast.add({
        type: "success",
        title: clientsCatalogCopy.savedCount(result.prospects.length),
      })
      setSearch(null)
      setSelectedIds(new Set())
      router.refresh()
    })
  }

  async function handleStatusChange(id: string, status: ProspectStatus) {
    setStatusPendingId(id)
    const result = await updateProspectStatusAction({ id, status })
    setStatusPendingId(null)
    if (!result.ok) {
      toast.add({ type: "error", title: result.error })
      return
    }
    setProspects((current) =>
      current.map((prospect) =>
        prospect.id === id
          ? { ...prospect, status: result.prospect.status }
          : prospect
      )
    )
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-8">
      <ClientsSearchBar
        cityQuery={cityQuery}
        segment={segment}
        searching={searching}
        onCityChange={setCityQuery}
        onSegmentChange={setSegment}
        onSubmit={handleSearch}
      />

      <ClientsSearchBatch
        search={search}
        searching={searching}
        saving={saving}
        selectedIds={selectedIds}
        onToggle={toggleCandidate}
        onSave={handleSave}
      />

      <ClientsSavedSection
        prospects={prospects}
        visibleProspects={visibleProspects}
        statusFilter={statusFilter}
        statusPendingId={statusPendingId}
        onStatusFilterChange={setStatusFilter}
        onStatusChange={handleStatusChange}
      />
    </div>
  )
}
