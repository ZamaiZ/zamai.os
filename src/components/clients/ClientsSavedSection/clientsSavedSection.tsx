"use client"

import { motion, useReducedMotion } from "motion/react"

import { ClientsEmptyState } from "@/components/clients/ClientsEmptyState"
import {
  clientsCatalogCopy,
  STATUS_FILTER_LABELS,
  STATUS_LABELS,
  WEBSITE_KIND_LABELS,
} from "@/components/clients/shared/constants"
import { countByStatusFilter } from "@/components/clients/shared/filterProspects"
import type {
  CatalogProspect,
  StatusFilter,
} from "@/components/clients/shared/types"
import { STATUS_FILTERS } from "@/components/clients/shared/types"
import {
  ArrowUpRightIcon,
  GlobeIcon,
  GoogleIcon,
  InstagramIcon,
  PhoneIcon,
  ShopIcon,
} from "@/components/icons"
import { Badge } from "@/components/primitives/badge"
import { buttonVariants } from "@/components/primitives/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/primitives/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/primitives/table"
import { getProspectSegmentLabel } from "@/lib/prospects/segments"
import { PROSPECT_STATUSES, type ProspectStatus } from "@/lib/prospects/status"
import type { SavableWebsiteKind } from "@/lib/prospects/websiteKind"
import { cn } from "@/lib/utils"

const STATUS_DOT: Record<ProspectStatus, string> = {
  prospect: "bg-primary",
  contacted: "bg-amber-500",
  discarded: "bg-muted-foreground/35",
  client: "bg-emerald-500",
}

type ClientsSavedSectionProps = {
  prospects: CatalogProspect[]
  visibleProspects: CatalogProspect[]
  statusFilter: StatusFilter
  statusPendingId: string | null
  onStatusFilterChange: (filter: StatusFilter) => void
  onStatusChange: (id: string, status: ProspectStatus) => void
}

function WebsiteKindIcon({ kind }: { kind: SavableWebsiteKind }) {
  if (kind === "social") return <InstagramIcon aria-hidden className="size-3" />
  if (kind === "aggregator") return <ShopIcon aria-hidden className="size-3" />
  return <GlobeIcon aria-hidden className="size-3" />
}

export function ClientsSavedSection({
  prospects,
  visibleProspects,
  statusFilter,
  statusPendingId,
  onStatusFilterChange,
  onStatusChange,
}: ClientsSavedSectionProps) {
  const reduceMotion = useReducedMotion()

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-[-0.02em]">
            {clientsCatalogCopy.savedTitle}
          </h2>
          <p className="text-[0.65rem] tracking-[0.12em] text-muted-foreground uppercase">
            {clientsCatalogCopy.attribution}
          </p>
        </div>
        <div
          role="group"
          aria-label={clientsCatalogCopy.filterStatusLabel}
          className="flex flex-wrap gap-1.5"
        >
          {STATUS_FILTERS.map((filter) => {
            const count = countByStatusFilter(prospects, filter)
            const pressed = statusFilter === filter
            return (
              <button
                key={filter}
                type="button"
                aria-pressed={pressed}
                onClick={() => onStatusFilterChange(filter)}
                className={cn(
                  "inline-flex h-8 items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium transition-colors duration-150",
                  pressed
                    ? "border-primary/30 bg-primary/12 text-primary"
                    : "border-border/80 bg-background text-muted-foreground hover:border-border hover:text-foreground"
                )}
              >
                {STATUS_FILTER_LABELS[filter]}
                <span
                  className={cn(
                    "rounded-full px-1.5 py-px text-[0.65rem] tabular-nums",
                    pressed ? "bg-primary/15" : "bg-muted"
                  )}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {visibleProspects.length === 0 ? (
        <ClientsEmptyState variant="saved" />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/80 bg-card">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>{clientsCatalogCopy.columnName}</TableHead>
                <TableHead className="hidden md:table-cell">
                  {clientsCatalogCopy.columnAddress}
                </TableHead>
                <TableHead>{clientsCatalogCopy.columnWebsite}</TableHead>
                <TableHead className="hidden sm:table-cell">
                  {clientsCatalogCopy.columnMaps}
                </TableHead>
                <TableHead className="hidden lg:table-cell">
                  {clientsCatalogCopy.columnSegment}
                </TableHead>
                <TableHead>{clientsCatalogCopy.columnStatus}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleProspects.map((prospect, index) => (
                <motion.tr
                  key={prospect.id}
                  data-slot="table-row"
                  initial={reduceMotion ? false : { opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.18,
                    delay: Math.min(index, 16) * 0.03,
                    ease: "easeOut",
                  }}
                  className="border-b transition-colors duration-150 hover:bg-muted/50"
                >
                  <TableCell>
                    <div className="font-medium">{prospect.name}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground md:hidden">
                      {prospect.formattedAddress}
                    </div>
                  </TableCell>
                  <TableCell className="hidden max-w-xs truncate text-muted-foreground md:table-cell">
                    {prospect.formattedAddress}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className="gap-1">
                        <WebsiteKindIcon kind={prospect.websiteKind} />
                        {WEBSITE_KIND_LABELS[prospect.websiteKind]}
                      </Badge>
                      {prospect.websiteUri ? (
                        <a
                          href={prospect.websiteUri}
                          target="_blank"
                          rel="noreferrer"
                          className={buttonVariants({
                            variant: "ghost",
                            size: "icon-xs",
                          })}
                          aria-label={prospect.websiteUri}
                        >
                          <ArrowUpRightIcon />
                        </a>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div className="flex items-center gap-0.5">
                      {prospect.phone ? (
                        <a
                          href={`tel:${prospect.phone.replace(/\s/g, "")}`}
                          className={buttonVariants({
                            variant: "ghost",
                            size: "icon-sm",
                          })}
                          aria-label={prospect.phone}
                        >
                          <PhoneIcon />
                        </a>
                      ) : null}
                      {prospect.googleMapsUri ? (
                        <a
                          href={prospect.googleMapsUri}
                          target="_blank"
                          rel="noreferrer"
                          className={buttonVariants({
                            variant: "ghost",
                            size: "icon-sm",
                          })}
                          aria-label={clientsCatalogCopy.mapsLink}
                        >
                          <GoogleIcon />
                        </a>
                      ) : (
                        <span className="text-muted-foreground">
                          {clientsCatalogCopy.noPhone}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {prospect.primaryType
                      ? getProspectSegmentLabel(prospect.primaryType)
                      : clientsCatalogCopy.noPhone}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={prospect.status}
                      disabled={statusPendingId === prospect.id}
                      items={STATUS_LABELS}
                      onValueChange={(value) => {
                        if (
                          typeof value === "string" &&
                          PROSPECT_STATUSES.includes(value as ProspectStatus)
                        ) {
                          onStatusChange(prospect.id, value as ProspectStatus)
                        }
                      }}
                    >
                      <SelectTrigger size="sm" className="w-36">
                        <span
                          aria-hidden
                          className={cn(
                            "size-1.5 rounded-full",
                            STATUS_DOT[prospect.status]
                          )}
                        />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PROSPECT_STATUSES.map((status) => (
                          <SelectItem key={status} value={status}>
                            <span
                              aria-hidden
                              className={cn(
                                "size-1.5 rounded-full",
                                STATUS_DOT[status]
                              )}
                            />
                            {STATUS_LABELS[status]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  )
}
