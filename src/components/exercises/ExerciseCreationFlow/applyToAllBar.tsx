"use client"

import { EquipmentField } from "@/components/exercises/shared/equipmentField"
import type { EquipmentOption } from "@/components/exercises/shared/equipmentField"
import { exercisesCatalogCopy } from "@/components/exercises/shared/constants"
import { MuscleGroupField } from "@/components/exercises/shared/muscleGroupField"
import type { CatalogMuscleGroup } from "@/components/exercises/shared/types"

type ApplyToAllBarProps = {
  muscleGroups: CatalogMuscleGroup[]
  equipmentOptions: Array<string | null | undefined>
  group: CatalogMuscleGroup | null
  equipment: EquipmentOption | null
  onGroupChange: (group: CatalogMuscleGroup | null) => void
  onEquipmentChange: (equipment: EquipmentOption | null) => void
  disabled?: boolean
}

export function ApplyToAllBar({
  muscleGroups,
  equipmentOptions,
  group,
  equipment,
  onGroupChange,
  onEquipmentChange,
  disabled = false,
}: ApplyToAllBarProps) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium text-foreground">
        {exercisesCatalogCopy.bulkApplyToAll}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <MuscleGroupField
          id="bulk-apply-group"
          muscleGroups={muscleGroups}
          value={group}
          onChange={onGroupChange}
          disabled={disabled}
        />
        <EquipmentField
          id="bulk-apply-equipment"
          equipmentOptions={equipmentOptions}
          value={equipment}
          onChange={onEquipmentChange}
          disabled={disabled}
        />
      </div>
    </div>
  )
}
