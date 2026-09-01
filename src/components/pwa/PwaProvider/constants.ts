export const pwaServiceWorkerConfig = {
  path: "/sw.js",
  scope: "/",
  updateViaCache: "none",
} as const

export const pwaProviderError = "usePwa must be used within PwaProvider"
