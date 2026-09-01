"use client"

import { motion, useReducedMotion } from "motion/react"

import { ClientsCatalogSkeleton } from "@/components/clients/ClientsCatalogSkeleton"
import { ClientsEmptyState } from "@/components/clients/ClientsEmptyState"
import {
  clientsCatalogCopy,
  WEBSITE_KIND_LABELS,
} from "@/components/clients/shared/constants"
import { isSelectableCandidate } from "@/components/clients/shared/filterProspects"
import type { CatalogCandidate, CatalogSearch } from "@/components/clients/shared/types"
import {
  ArrowUpRightIcon,
  GeoAltIcon,
  GlobeIcon,
  GoogleIcon,
  InstagramIcon,
  PhoneIcon,
  ShopIcon,
} from "@/components/icons"
import { getInitials } from "@/components/layout/shared/getInitials"
import { Badge } from "@/components/primitives/badge"
import { Button, buttonVariants } from "@/components/primitives/button"
import { Checkbox } from "@/components/primitives/checkbox"
import { Spinner } from "@/components/primitives/spinner"
import type { SavableWebsiteKind } from "@/lib/prospects/websiteKind"
import { cn } from "@/lib/utils"

type ClientsSearchBatchProps = {
  search: CatalogSearch | null
  searching: boolean
  saving: boolean
  selectedIds: Set<string>
  onToggle: (id: string, checked: boolean) => void
  onSave: () => void
}

function WebsiteKindIcon({ kind }: { kind: SavableWebsiteKind }) {
  if (kind === "social") return <InstagramIcon aria-hidden className="size-3" />
  if (kind === "aggregator") return <ShopIcon aria-hidden className="size-3" />
  return <GlobeIcon aria-hidden className="size-3" />
}

export function ClientsSearchBatch({
  search,
  searching,
  saving,
  selectedIds,
  onToggle,
  onSave,
}: ClientsSearchBatchProps) {
  const reduceMotion = useReducedMotion()

  if (searching) {
    return (
      <section className="flex flex-col gap-3">
        <div className="h-9 w-48 animate-pulse rounded-xl bg-muted" />
        <ClientsCatalogSkeleton />
      </section>
    )
  }

  if (!search) return null

  const selectable = search.candidates.filter(isSelectableCandidate)

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/8 px-2.5 py-1 text-xs font-medium text-primary">
              <GeoAltIcon aria-hidden className="size-3.5" />
              {search.geocodedLabel}
            </span>
            <span className="text-xs text-muted-foreground">
              {clientsCatalogCopy.googleCount} {search.googleResultCount}
              <span className="mx-1.5 text-border">·</span>
              {clientsCatalogCopy.matchedCount} {search.matchedCount}
            </span>
          </div>
        </div>
        <Button
          type="button"
          onClick={onSave}
          disabled={saving || selectedIds.size === 0}
        >
          {saving ? (
            <>
              <Spinner data-icon="inline-start" />
              {clientsCatalogCopy.saving}
            </>
          ) : (
            clientsCatalogCopy.saveSelected(selectedIds.size)
          )}
        </Button>
      </div>

      {search.candidates.length === 0 ? (
        <ClientsEmptyState variant="batch" />
      ) : (
        <ul className="overflow-hidden rounded-xl border border-border/80 bg-card">
          {search.candidates.map((candidate, index) => (
            <CandidateRow
              key={candidate.googlePlaceId}
              candidate={candidate}
              index={index}
              reduceMotion={Boolean(reduceMotion)}
              checked={selectedIds.has(candidate.googlePlaceId)}
              saving={saving}
              onToggle={onToggle}
            />
          ))}
        </ul>
      )}

      <p className="text-[0.65rem] tracking-[0.12em] text-muted-foreground uppercase">
        {clientsCatalogCopy.attribution}
      </p>
      <span className="sr-only">
        {selectable.length} selecionáveis neste lote.
      </span>
    </section>
  )
}

function CandidateRow({
  candidate,
  index,
  reduceMotion,
  checked,
  saving,
  onToggle,
}: {
  candidate: CatalogCandidate
  index: number
  reduceMotion: boolean
  checked: boolean
  saving: boolean
  onToggle: (id: string, checked: boolean) => void
}) {
  const selectable = isSelectableCandidate(candidate)

  return (
    <motion.li
      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.2,
        delay: Math.min(index, 12) * 0.035,
        ease: "easeOut",
      }}
      className={cn(
        "flex items-start gap-3 border-b border-border/70 px-4 py-3 last:border-b-0 transition-colors duration-150 hover:bg-muted/40",
        !selectable && "bg-muted/25"
      )}
    >
      <Checkbox
        className="mt-2"
        checked={checked}
        disabled={!selectable || saving}
        onCheckedChange={(value) =>
          onToggle(candidate.googlePlaceId, value === true)
        }
        aria-label={candidate.name}
      />
      <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-[0.7rem] font-semibold tracking-wide text-primary">
        {getInitials(candidate.name)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium">{candidate.name}</p>
          {candidate.alreadySaved && !candidate.nowHasOwnWebsite ? (
            <Badge variant="secondary">{clientsCatalogCopy.alreadySaved}</Badge>
          ) : null}
          {candidate.nowHasOwnWebsite ? (
            <Badge variant="outline">{clientsCatalogCopy.nowHasWebsite}</Badge>
          ) : (
            <Badge variant="outline" className="gap-1">
              <WebsiteKindIcon kind={candidate.websiteKind} />
              {WEBSITE_KIND_LABELS[candidate.websiteKind]}
            </Badge>
          )}
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {candidate.formattedAddress}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-0.5">
        {candidate.phone ? (
          <a
            href={`tel:${candidate.phone.replace(/\s/g, "")}`}
            className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
            aria-label={candidate.phone}
          >
            <PhoneIcon />
          </a>
        ) : null}
        {candidate.googleMapsUri ? (
          <a
            href={candidate.googleMapsUri}
            target="_blank"
            rel="noreferrer"
            className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
            aria-label={clientsCatalogCopy.mapsLink}
          >
            <GoogleIcon />
          </a>
        ) : null}
        {candidate.websiteUri ? (
          <a
            href={candidate.websiteUri}
            target="_blank"
            rel="noreferrer"
            className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
            aria-label={candidate.websiteUri}
          >
            <ArrowUpRightIcon />
          </a>
        ) : null}
      </div>
    </motion.li>
  )
}
