import type { ProspectStatus } from "@/lib/prospects/status"
import type { SavableWebsiteKind } from "@/lib/prospects/websiteKind"

import type { StatusFilter } from "./types"

export const clientsCatalogCopy = {
  eyebrow: "Prospecção",
  title: "Clientes",
  description:
    "Pesquise empresas sem site próprio no Google Maps e grave os prospectos.",
  cityLabel: "Cidade",
  cityPlaceholder: "Joinville SC",
  cityHint: "Inclua a UF para evitar cidade errada.",
  segmentLabel: "Segmento",
  segmentPlaceholder: "Escolher segmento",
  segmentEmpty: "Nenhum segmento encontrado.",
  search: "Pesquisar",
  searching: "Pesquisando…",
  attribution: "Powered by Google",
  resultsIn: (label: string) => `Resultados em ${label}`,
  counts: (google: number, matched: number) =>
    `Google ${google} · sem site próprio ${matched}`,
  emptyBatchTitle: "Nenhum prospecto neste lote",
  emptyBatchDescription:
    "O Google devolveu resultados, mas todos têm site próprio ou a busca veio vazia. Tente outro segmento ou uma cidade menor.",
  alreadySaved: "Já salvo",
  nowHasWebsite: "Agora tem site próprio",
  confirmSave: "Salvar selecionados",
  saveSelected: (count: number) =>
    count === 1 ? "Salvar 1" : `Salvar ${count}`,
  saving: "Salvando…",
  noneSelected: "Nenhum item selecionado.",
  selectAll: "Selecionar todos",
  googleCount: "Google",
  matchedCount: "Sem site",
  savedCount: (count: number) =>
    count === 1 ? "1 prospecto salvo" : `${count} prospectos salvos`,
  savedTitle: "Salvos",
  filterStatusLabel: "Status",
  emptySavedTitle: "Nenhum prospecto salvo",
  emptySavedDescription:
    "Pesquise uma cidade e um segmento, depois confirme o lote.",
  columnName: "Empresa",
  columnAddress: "Endereço",
  columnPhone: "Telefone",
  columnWebsite: "Presença",
  columnMaps: "Google",
  columnSegment: "Segmento",
  columnStatus: "Status",
  mapsLink: "Perfil",
  noPhone: "—",
} as const

export const STATUS_LABELS: Record<ProspectStatus, string> = {
  prospect: "Prospecto",
  contacted: "Contatado",
  discarded: "Descartado",
  client: "Cliente",
}

export const STATUS_FILTER_LABELS: Record<StatusFilter, string> = {
  active: "Ativos",
  all: "Todos",
  prospect: "Prospecto",
  contacted: "Contatado",
  discarded: "Descartado",
  client: "Cliente",
}

export const WEBSITE_KIND_LABELS: Record<SavableWebsiteKind, string> = {
  none: "Sem site",
  social: "Rede social",
  aggregator: "Agregador",
}
