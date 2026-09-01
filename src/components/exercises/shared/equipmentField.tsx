"use client"

import { exercisesCatalogCopy } from "@/components/exercises/shared/constants"
import { listEquipmentCatalogOptions } from "@/components/exercises/shared/equipmentMeta"
import { WeightIcon } from "@/components/icons"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/primitives/combobox"
import { InputGroupAddon } from "@/components/primitives/inputGroup"
import { Label } from "@/components/primitives/label"
import { cn } from "@/lib/utils"

export type EquipmentOption = {
  value: string
  label: string
}

type EquipmentFieldProps = {
  id: string
  equipmentOptions?: Array<string | null | undefined>
  catalogOptions?: EquipmentOption[]
  value: EquipmentOption | null
  onChange: (value: EquipmentOption | null) => void
  disabled?: boolean
  hideLabel?: boolean
  className?: string
}

export function EquipmentField({
  id,
  equipmentOptions = [],
  catalogOptions,
  value,
  onChange,
  disabled = false,
  hideLabel = false,
  className,
}: EquipmentFieldProps) {
  const items =
    catalogOptions ?? listEquipmentCatalogOptions(equipmentOptions)

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {hideLabel ? null : (
        <Label htmlFor={id}>
          {exercisesCatalogCopy.newExerciseEquipmentLabel}
        </Label>
      )}
      <Combobox
        autoHighlight
        items={items}
        value={value}
        onValueChange={(next) =>
          onChange((next as EquipmentOption | null) ?? null)
        }
        isItemEqualToValue={(a, b) => a.value === b.value}
        itemToStringLabel={(item) => item.label}
        itemToStringValue={(item) => item.value}
        disabled={disabled}
      >
        <ComboboxInput
          id={id}
          placeholder={exercisesCatalogCopy.newExerciseEquipmentPlaceholder}
          showClear={Boolean(value)}
          className="w-full rounded-4xl"
          disabled={disabled}
          aria-label={exercisesCatalogCopy.newExerciseEquipmentLabel}
        >
          <InputGroupAddon align="inline-start">
            <WeightIcon aria-hidden />
          </InputGroupAddon>
        </ComboboxInput>
        <ComboboxContent className="z-[60] min-w-[16rem]">
          <ComboboxEmpty>
            {exercisesCatalogCopy.newExerciseEquipmentEmpty}
          </ComboboxEmpty>
          <ComboboxList>
            {(item) => (
              <ComboboxItem key={item.value} value={item}>
                {item.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  )
}
