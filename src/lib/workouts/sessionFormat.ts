export function formatElapsedClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds))
  const hours = Math.floor(safe / 3600)
  const minutes = Math.floor((safe % 3600) / 60)
  const seconds = safe % 60
  const mm = String(minutes).padStart(2, "0")
  const ss = String(seconds).padStart(2, "0")
  if (hours > 0) {
    return `${hours}:${mm}:${ss}`
  }
  return `${mm}:${ss}`
}

export function formatDurationMinutes(totalSeconds: number): string {
  const minutes = Math.round(totalSeconds / 60)
  if (minutes <= 0) return "0 min"
  return `${minutes} min`
}

export function formatKg(value: number, digits = 2): string {
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  }).format(value)
}

export function formatSessionDate(iso: string): string {
  const formatted = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(iso))
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

export function formatPrevious(weightKg: number, reps: number): string {
  return `${formatKg(weightKg, 1)} × ${reps}`
}

export function formatSignedKg(value: number, digits = 0): string {
  const formatted = formatKg(Math.abs(value), digits)
  if (value > 0) return `+${formatted} kg`
  if (value < 0) return `−${formatted} kg`
  return `${formatted} kg`
}

export function formatSignedPercent(value: number): string {
  const formatted = new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  }).format(Math.abs(value))
  if (value > 0) return `+${formatted}%`
  if (value < 0) return `−${formatted}%`
  return `${formatted}%`
}

export function formatCompactSessionDate(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso))
}
