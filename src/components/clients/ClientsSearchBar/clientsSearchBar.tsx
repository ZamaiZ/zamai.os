"use client"

import { clientsCatalogCopy } from "@/components/clients/shared/constants"
import { GeoAltIcon, SearchIcon, TagIcon } from "@/components/icons"
import { NeonGlowCard } from "@/components/exercises/NeonGlowCard"
import { Button } from "@/components/primitives/button"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/primitives/combobox"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/primitives/inputGroup"
import { Label } from "@/components/primitives/label"
import { Spinner } from "@/components/primitives/spinner"
import { PROSPECT_SEGMENTS } from "@/lib/prospects/segments"

type ProspectSegment = (typeof PROSPECT_SEGMENTS)[number]

type ClientsSearchBarProps = {
  cityQuery: string
  segment: ProspectSegment | null
  searching: boolean
  onCityChange: (value: string) => void
  onSegmentChange: (segment: ProspectSegment | null) => void
  onSubmit: (event: React.FormEvent) => void
}

export function ClientsSearchBar({
  cityQuery,
  segment,
  searching,
  onCityChange,
  onSegmentChange,
  onSubmit,
}: ClientsSearchBarProps) {
  return (
    <NeonGlowCard>
      <form onSubmit={onSubmit} className="p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(13rem,16rem)_auto] sm:items-end">
          <div className="flex flex-col gap-2">
            <Label htmlFor="prospect-city">{clientsCatalogCopy.cityLabel}</Label>
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <GeoAltIcon aria-hidden />
              </InputGroupAddon>
              <InputGroupInput
                id="prospect-city"
                value={cityQuery}
                onChange={(event) => onCityChange(event.target.value)}
                placeholder={clientsCatalogCopy.cityPlaceholder}
                autoComplete="off"
                disabled={searching}
                required
                minLength={2}
                title={clientsCatalogCopy.cityHint}
                aria-describedby="prospect-city-hint"
              />
            </InputGroup>
            <p id="prospect-city-hint" className="sr-only">
              {clientsCatalogCopy.cityHint}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="prospect-segment">
              {clientsCatalogCopy.segmentLabel}
            </Label>
            <Combobox<ProspectSegment>
              autoHighlight
              items={[...PROSPECT_SEGMENTS]}
              value={segment}
              onValueChange={(next) =>
                onSegmentChange((next as ProspectSegment | null) ?? null)
              }
              isItemEqualToValue={(a, b) => a.id === b.id}
              itemToStringLabel={(item) => item.label}
              itemToStringValue={(item) => item.id}
              disabled={searching}
            >
              <ComboboxInput
                id="prospect-segment"
                placeholder={clientsCatalogCopy.segmentPlaceholder}
                className="w-full rounded-4xl"
                disabled={searching}
                aria-label={clientsCatalogCopy.segmentLabel}
              >
                <InputGroupAddon align="inline-start">
                  <TagIcon aria-hidden />
                </InputGroupAddon>
              </ComboboxInput>
              <ComboboxContent className="min-w-[16rem]">
                <ComboboxEmpty>{clientsCatalogCopy.segmentEmpty}</ComboboxEmpty>
                <ComboboxList>
                  {(item) => (
                    <ComboboxItem key={item.id} value={item}>
                      {item.label}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>

          <Button type="submit" disabled={searching} className="h-9">
            {searching ? (
              <>
                <Spinner data-icon="inline-start" />
                {clientsCatalogCopy.searching}
              </>
            ) : (
              <>
                <SearchIcon data-icon="inline-start" aria-hidden />
                {clientsCatalogCopy.search}
              </>
            )}
          </Button>
        </div>
      </form>
    </NeonGlowCard>
  )
}
