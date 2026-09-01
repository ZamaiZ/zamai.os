"use server"

import { requireAuthenticatedUser } from "@/lib/auth/session"
import {
  listProspectsQuerySchema,
  prospectIdParamSchema,
  saveProspectsSchema,
  searchProspectsSchema,
  updateProspectStatusSchema,
} from "@/lib/validations/prospects"
import {
  CityNotFoundError,
  GooglePlacesError,
  ProspectNotFoundError,
  ProspectRateLimitedError,
  ProspectSearchNotFoundError,
  ProspectService,
  type ProspectDto,
  type ProspectSearchDto,
} from "@/server/modules/prospects"
import type { ProspectStatus } from "@/lib/prospects/status"

export type ProspectSearchResult =
  | { ok: true; search: ProspectSearchDto }
  | { ok: false; error: string }

export type ProspectSaveResult =
  | { ok: true; prospects: ProspectDto[] }
  | { ok: false; error: string }

export type ProspectStatusResult =
  | { ok: true; prospect: ProspectDto }
  | { ok: false; error: string }

function mapSearchError(error: unknown): string {
  if (error instanceof ProspectRateLimitedError) {
    return "Muitas buscas em pouco tempo. Espere alguns minutos."
  }
  if (error instanceof CityNotFoundError) {
    return "Cidade não encontrada. Inclua a UF, por exemplo: Joinville SC."
  }
  if (error instanceof GooglePlacesError) {
    return "Não foi possível consultar o Google Maps agora."
  }
  if (
    error instanceof Error &&
    error.message.includes("GOOGLE_MAPS_API_KEY")
  ) {
    return "Chave do Google Maps não configurada."
  }
  return "Não foi possível pesquisar empresas."
}

export async function searchProspectsAction(input: {
  cityQuery: string
  includedType: string
}): Promise<ProspectSearchResult> {
  const user = await requireAuthenticatedUser()
  const parsed = searchProspectsSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: "Informe a cidade e o segmento." }
  }

  try {
    const search = await ProspectService.searchProspects({
      cityQuery: parsed.data.cityQuery,
      includedType: parsed.data.includedType,
      userId: user.id,
    })
    return { ok: true, search }
  } catch (error) {
    return { ok: false, error: mapSearchError(error) }
  }
}

export async function saveProspectsAction(input: {
  searchId: string
  googlePlaceIds: string[]
}): Promise<ProspectSaveResult> {
  await requireAuthenticatedUser()
  const parsed = saveProspectsSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: "Seleção inválida." }
  }

  try {
    const prospects = await ProspectService.saveProspects({
      searchId: parsed.data.searchId,
      googlePlaceIds: parsed.data.googlePlaceIds,
    })
    return { ok: true, prospects }
  } catch (error) {
    if (error instanceof ProspectSearchNotFoundError) {
      return { ok: false, error: "Busca expirada. Pesquise de novo." }
    }
    return { ok: false, error: "Não foi possível salvar os prospectos." }
  }
}

export async function updateProspectStatusAction(input: {
  id: string
  status: ProspectStatus
}): Promise<ProspectStatusResult> {
  await requireAuthenticatedUser()
  const parsedId = prospectIdParamSchema.safeParse({ id: input.id })
  const parsedStatus = updateProspectStatusSchema.safeParse({
    status: input.status,
  })
  if (!parsedId.success || !parsedStatus.success) {
    return { ok: false, error: "Status inválido." }
  }

  try {
    const prospect = await ProspectService.updateProspectStatus({
      id: parsedId.data.id,
      status: parsedStatus.data.status,
    })
    return { ok: true, prospect }
  } catch (error) {
    if (error instanceof ProspectNotFoundError) {
      return { ok: false, error: "Prospecto não encontrado." }
    }
    return { ok: false, error: "Não foi possível atualizar o status." }
  }
}

export async function listProspectsAction(status?: ProspectStatus | "all") {
  await requireAuthenticatedUser()
  const parsed = listProspectsQuerySchema.safeParse({ status })
  return ProspectService.listProspects({
    status: parsed.success ? parsed.data.status : undefined,
  })
}
