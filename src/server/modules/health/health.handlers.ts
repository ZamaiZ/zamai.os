import { json } from "@/server/http/response"
import type { ApiHandler } from "@/server/http/types"

export const healthHandler: ApiHandler = async () => {
  return json({ ok: true })
}
