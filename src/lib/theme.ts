export type ThemeValue = "system" | "light" | "dark"

const themeCycle: Record<ThemeValue, ThemeValue> = {
  system: "light",
  light: "dark",
  dark: "system",
}

export function isThemeValue(value: unknown): value is ThemeValue {
  return value === "system" || value === "light" || value === "dark"
}

export function nextTheme(current: string | undefined): ThemeValue {
  if (current === undefined) return themeCycle.system
  if (!isThemeValue(current)) return "system"
  return themeCycle[current]
}
