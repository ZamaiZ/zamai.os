export const WORKOUT_SET_KINDS = ["warmup", "work"] as const

export type WorkoutSetKind = (typeof WORKOUT_SET_KINDS)[number]

export type WorkoutSetProtocolSlot = {
  slot: 1 | 2 | 3 | 4 | 5 | 6
  kind: WorkoutSetKind
  targetReps: number
  restAfterSeconds: number
}

export const WORKOUT_SET_PROTOCOL = [
  { slot: 1, kind: "warmup", targetReps: 15, restAfterSeconds: 60 },
  { slot: 2, kind: "warmup", targetReps: 12, restAfterSeconds: 90 },
  { slot: 3, kind: "work", targetReps: 8, restAfterSeconds: 120 },
  { slot: 4, kind: "work", targetReps: 7, restAfterSeconds: 150 },
  { slot: 5, kind: "work", targetReps: 6, restAfterSeconds: 180 },
  { slot: 6, kind: "work", targetReps: 6, restAfterSeconds: 190 },
] as const satisfies readonly WorkoutSetProtocolSlot[]

const KIND_SHORT: Record<WorkoutSetKind, string> = {
  warmup: "Aq",
  work: "Tr",
}

export function formatProtocolSlot(slot: WorkoutSetProtocolSlot): string {
  return `${KIND_SHORT[slot.kind]} ${slot.targetReps} · ${slot.restAfterSeconds}s`
}

export function formatProtocolSetLabel(slot: WorkoutSetProtocolSlot): string {
  return `${KIND_SHORT[slot.kind]} ${slot.targetReps}`
}

export function getProtocolSlot(slot: number): WorkoutSetProtocolSlot {
  const found = WORKOUT_SET_PROTOCOL.find((item) => item.slot === slot)
  if (!found) {
    throw new Error(`Unknown protocol slot: ${slot}`)
  }
  return found
}

export function formatProtocolRail(
  slots: readonly WorkoutSetProtocolSlot[] = WORKOUT_SET_PROTOCOL
): string {
  return slots.map(formatProtocolSlot).join(" → ")
}
