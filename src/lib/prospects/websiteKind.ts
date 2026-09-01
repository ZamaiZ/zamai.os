export const WEBSITE_KINDS = ["none", "social", "aggregator", "own"] as const

export type WebsiteKind = (typeof WEBSITE_KINDS)[number]

export type SavableWebsiteKind = Exclude<WebsiteKind, "own">

const SOCIAL_HOSTS = [
  "instagram.com",
  "instagr.am",
  "facebook.com",
  "fb.com",
  "fb.me",
  "messenger.com",
  "whatsapp.com",
  "wa.me",
  "tiktok.com",
  "youtube.com",
  "youtu.be",
  "twitter.com",
  "x.com",
  "threads.net",
  "kwai.com",
  "kw.ai",
] as const

const LINK_IN_BIO_HOSTS = ["linktr.ee", "linktree.com", "lnk.bio", "beacons.ai"] as const

const AGGREGATOR_HOSTS = [
  "ifood.com.br",
  "ifood.com",
  "rappi.com",
  "rappi.com.br",
  "ubereats.com",
  "uber.com",
  "doctoralia.com.br",
  "doctoralia.com",
  "hotmart.com",
  "getninjas.com.br",
  "tripadvisor.com",
  "tripadvisor.com.br",
  "booking.com",
  "sites.google.com",
  "business.site",
  "g.page",
  "maps.app.goo.gl",
  "goo.gl",
] as const

function stripWww(hostname: string) {
  return hostname.toLowerCase().replace(/^www\./, "")
}

function hostMatches(hostname: string, hosts: readonly string[]) {
  return hosts.some(
    (host) => hostname === host || hostname.endsWith(`.${host}`)
  )
}

function isGoogleMapsHost(hostname: string, pathname: string) {
  if (hostname === "maps.google.com" || hostname.endsWith(".maps.google.com")) {
    return true
  }
  if (hostname === "google.com" || hostname.endsWith(".google.com")) {
    return pathname.startsWith("/maps")
  }
  if (hostname === "google.com.br" || hostname.endsWith(".google.com.br")) {
    return pathname.startsWith("/maps")
  }
  return false
}

export function classifyWebsiteUri(websiteUri: string | null | undefined): WebsiteKind {
  const raw = websiteUri?.trim()
  if (!raw) {
    return "none"
  }

  let url: URL
  try {
    url = new URL(raw.includes("://") ? raw : `https://${raw}`)
  } catch {
    return "own"
  }

  const hostname = stripWww(url.hostname)
  const pathname = url.pathname.toLowerCase()

  if (hostMatches(hostname, SOCIAL_HOSTS)) {
    return "social"
  }
  if (hostMatches(hostname, LINK_IN_BIO_HOSTS)) {
    return "social"
  }
  if (hostMatches(hostname, AGGREGATOR_HOSTS) || isGoogleMapsHost(hostname, pathname)) {
    return "aggregator"
  }

  return "own"
}

export function isSavableWebsiteKind(
  kind: WebsiteKind
): kind is SavableWebsiteKind {
  return kind !== "own"
}
