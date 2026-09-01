const IPV4_PATTERN = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/

function parseIpv4(value: string): number | null {
  const match = IPV4_PATTERN.exec(value)

  if (!match) {
    return null
  }

  const octets = match.slice(1).map(Number)

  if (octets.some((octet) => octet > 255)) {
    return null
  }

  return (
    ((octets[0] << 24) >>> 0) +
    ((octets[1] << 16) >>> 0) +
    ((octets[2] << 8) >>> 0) +
    (octets[3] >>> 0)
  )
}

function ipv4MatchesCidr(ip: string, network: string, prefixLength: number): boolean {
  const ipValue = parseIpv4(ip)
  const networkValue = parseIpv4(network)

  if (ipValue === null || networkValue === null) {
    return false
  }

  if (prefixLength < 0 || prefixLength > 32) {
    return false
  }

  const mask = prefixLength === 0 ? 0 : (~0 << (32 - prefixLength)) >>> 0

  return (ipValue & mask) === (networkValue & mask)
}

export function parseAllowedIps(value: string | undefined): string[] {
  if (!value?.trim()) {
    return []
  }

  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
}

export function ipMatchesEntry(clientIp: string, entry: string): boolean {
  const [network, prefix] = entry.split("/")

  if (prefix !== undefined) {
    const prefixLength = Number(prefix)

    if (!Number.isInteger(prefixLength)) {
      return false
    }

    return ipv4MatchesCidr(clientIp, network, prefixLength)
  }

  return clientIp === entry
}

export function isIpAllowlistEnabled(
  allowedIps: string[],
  nodeEnv = process.env.NODE_ENV ?? "development"
): boolean {
  if (allowedIps.length > 0) {
    return true
  }

  return nodeEnv === "production"
}

export function isClientIpAllowed(
  clientIp: string,
  allowedIps: string[],
  nodeEnv = process.env.NODE_ENV ?? "development"
): boolean {
  if (!isIpAllowlistEnabled(allowedIps, nodeEnv)) {
    return true
  }

  if (clientIp === "unknown") {
    return nodeEnv !== "production"
  }

  return allowedIps.some((entry) => ipMatchesEntry(clientIp, entry))
}
