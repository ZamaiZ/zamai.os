export type WeightReference = {
  thresholdKg: number
  emoji: string
  label: string
}

export type ResolvedWeightReference = {
  current: WeightReference
  next: WeightReference | null
  progressToNext: number
}

export const WEIGHT_REFERENCES: readonly WeightReference[] = [
  { thresholdKg: 0, emoji: "🔥", label: "Aquecendo" },
  { thresholdKg: 500, emoji: "🐄", label: "Vaca adulta" },
  { thresholdKg: 750, emoji: "🐂", label: "Touro grande" },
  { thresholdKg: 1000, emoji: "🐎", label: "Cavalo pesado" },
  { thresholdKg: 1250, emoji: "🚗", label: "Carro pequeno" },
  { thresholdKg: 1500, emoji: "🚙", label: "Carro médio" },
  { thresholdKg: 1750, emoji: "🚙", label: "SUV" },
  { thresholdKg: 2000, emoji: "🚐", label: "Van pequena" },
  { thresholdKg: 2500, emoji: "🦛", label: "Hipopótamo jovem" },
  { thresholdKg: 3000, emoji: "🦛", label: "Hipopótamo adulto" },
  { thresholdKg: 3500, emoji: "🚐", label: "Van grande carregada" },
  { thresholdKg: 4000, emoji: "🐘", label: "Elefante jovem" },
  { thresholdKg: 4500, emoji: "🐘", label: "Elefante adulto pequeno" },
  { thresholdKg: 5000, emoji: "🐘", label: "Elefante africano" },
  { thresholdKg: 6000, emoji: "🚚", label: "Caminhão leve" },
  { thresholdKg: 7000, emoji: "🐘", label: "Elefante africano grande" },
  { thresholdKg: 8000, emoji: "🚚", label: "Caminhão pequeno carregado" },
  { thresholdKg: 9000, emoji: "🚛", label: "Caminhão médio" },
  { thresholdKg: 10000, emoji: "🚌", label: "Ônibus urbano vazio" },
  { thresholdKg: 12000, emoji: "🚌", label: "Ônibus urbano" },
  { thresholdKg: 14000, emoji: "🚛", label: "Caminhão médio carregado" },
  { thresholdKg: 16000, emoji: "🚌", label: "Ônibus grande carregado" },
  { thresholdKg: 18000, emoji: "🚛", label: "Caminhão pesado" },
  { thresholdKg: 20000, emoji: "🚛", label: "Caminhão pesado carregado" },
  { thresholdKg: 22500, emoji: "🚜", label: "Escavadeira média" },
  { thresholdKg: 25000, emoji: "🚜", label: "Escavadeira grande" },
  { thresholdKg: 27500, emoji: "🚛", label: "Carreta parcialmente carregada" },
  { thresholdKg: 30000, emoji: "🚛", label: "Carreta carregada" },
  { thresholdKg: 32500, emoji: "✈️", label: "Avião executivo grande" },
  { thresholdKg: 35000, emoji: "🚛", label: "Bitrem / conjunto pesado" },
  { thresholdKg: 37500, emoji: "🐋", label: "Baleia-jubarte pequena" },
  { thresholdKg: 40000, emoji: "🐋", label: "Baleia-jubarte" },
  { thresholdKg: 42500, emoji: "🐋", label: "Cachalote" },
  { thresholdKg: 45000, emoji: "🐋", label: "Cachalote grande" },
  { thresholdKg: 47500, emoji: "✈️", label: "Avião regional pequeno" },
  { thresholdKg: 50000, emoji: "🐋", label: "Baleia de grande porte" },
] as const

export function resolveWeightReference(volumeKg: number): ResolvedWeightReference {
  const safe = Number.isFinite(volumeKg) ? Math.max(0, volumeKg) : 0
  let currentIndex = 0
  for (let index = 0; index < WEIGHT_REFERENCES.length; index++) {
    const item = WEIGHT_REFERENCES[index]!
    if (item.thresholdKg <= safe) {
      currentIndex = index
    } else {
      break
    }
  }

  const current = WEIGHT_REFERENCES[currentIndex]!
  const next = WEIGHT_REFERENCES[currentIndex + 1] ?? null
  if (!next) {
    return { current, next: null, progressToNext: 1 }
  }

  const span = next.thresholdKg - current.thresholdKg
  const progressToNext =
    span <= 0 ? 1 : Math.min(1, Math.max(0, (safe - current.thresholdKg) / span))

  return { current, next, progressToNext }
}
