export const PROSPECT_STATUSES = [
  "prospect",
  "contacted",
  "discarded",
  "client",
] as const

export type ProspectStatus = (typeof PROSPECT_STATUSES)[number]
