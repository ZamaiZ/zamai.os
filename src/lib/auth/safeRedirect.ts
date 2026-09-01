export function getSafeRedirectPath(input: string | null | undefined): string {
  if (!input?.startsWith("/") || input.startsWith("//")) return "/"
  if (input.startsWith("/login") || input.startsWith("/sign-up")) return "/"
  return input
}
