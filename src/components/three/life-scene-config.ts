export const LIFE_PHASES = [
  "breathe",
  "understand",
  "align",
  "sharpen",
  "integrate",
] as const

export type LifePhase = (typeof LIFE_PHASES)[number]
export type OrbitPoint = [number, number, number]

export const PHASE_DURATION_SECONDS = 6

export const SCENE_COLORS = {
  space: "#071719",
  mist: "#b8c9c8",
  flow: "#5cc8c3",
  insight: "#ead54f",
} as const

export function phaseAtElapsed(seconds: number): LifePhase {
  const index =
    Math.floor(Math.max(0, seconds) / PHASE_DURATION_SECONDS) %
    LIFE_PHASES.length

  return LIFE_PHASES[index]
}

export function phaseProgress(seconds: number) {
  return (
    (Math.max(0, seconds) % PHASE_DURATION_SECONDS) /
    PHASE_DURATION_SECONDS
  )
}

export function orbitPoints(radius: number) {
  return Array.from({ length: 97 }, (_, index) => {
    const angle = (index / 96) * Math.PI * 2

    return [
      Math.cos(angle) * radius,
      Math.sin(angle) * radius * 0.42,
      Math.sin(angle) * 0.28
    ] satisfies OrbitPoint
  })
}
