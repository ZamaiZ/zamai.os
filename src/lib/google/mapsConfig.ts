import "server-only"

export function getGoogleMapsApiKey() {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY?.trim()
  if (!apiKey) {
    throw new Error("Missing required environment variable: GOOGLE_MAPS_API_KEY")
  }
  return apiKey
}
