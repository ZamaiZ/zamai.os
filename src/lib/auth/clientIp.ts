const MAX_IP_LENGTH = 64

function firstAddress(value: string | null): string | null {
  const address = value?.split(",", 1)[0]?.trim()

  if (!address || address.length > MAX_IP_LENGTH) {
    return null
  }

  return address
}

export function getClientIp(headers: Headers): string {
  return (
    firstAddress(headers.get("x-vercel-forwarded-for")) ??
    firstAddress(headers.get("x-forwarded-for")) ??
    "unknown"
  )
}
