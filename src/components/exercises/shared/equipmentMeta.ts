const EQUIPMENT_LABELS: Record<string, string> = {
  "assisted": "Assistido",
  "band": "Elástico",
  "barbell": "Barra",
  "body weight": "Peso corporal",
  "bosu ball": "Bosu",
  "cable": "Cabo",
  "dumbbell": "Halteres",
  "elliptical machine": "Elíptico",
  "ez barbell": "Barra EZ",
  "hammer": "Hammer",
  "kettlebell": "Kettlebell",
  "leverage machine": "Máquina",
  "medicine ball": "Medicine ball",
  "olympic barbell": "Barra olímpica",
  "resistance band": "Faixa elástica",
  "roller": "Rolo",
  "rope": "Corda",
  "skierg machine": "SkiErg",
  "sled machine": "Sled",
  "smith machine": "Smith",
  "stability ball": "Bola de estabilidade",
  "stationary bike": "Bike",
  "stepmill machine": "Stepmill",
  "tire": "Pneu",
  "trap bar": "Trap bar",
  "upper body ergometer": "Ergômetro",
  "weighted": "Com peso",
  "wheel roller": "Roda abdominal",
}

export function parseEquipmentLabel(equipment: string | null | undefined): string {
  if (!equipment) return ""
  const key = equipment.trim().toLowerCase()
  return EQUIPMENT_LABELS[key] ?? equipment
}

export function listEquipmentCatalogOptions(
  extra: Array<string | null | undefined> = []
): Array<{ value: string; label: string }> {
  const values = collectUniqueEquipment([
    ...Object.keys(EQUIPMENT_LABELS),
    ...extra,
  ])

  return values.map((value) => ({
    value,
    label: parseEquipmentLabel(value),
  }))
}

export function collectUniqueEquipment(
  equipmentValues: Array<string | null | undefined>
): string[] {
  const seen = new Set<string>()
  const result: string[] = []

  for (const value of equipmentValues) {
    const trimmed = value?.trim()
    if (!trimmed || seen.has(trimmed)) continue
    seen.add(trimmed)
    result.push(trimmed)
  }

  return result.sort((a, b) =>
    parseEquipmentLabel(a).localeCompare(parseEquipmentLabel(b), "pt-BR")
  )
}
