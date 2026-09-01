import { z } from "zod"

import { isProspectSegmentType } from "@/lib/prospects/segments"

export const searchProspectsSchema = z.object({
  cityQuery: z.string().trim().min(2).max(120),
  includedType: z
    .string()
    .refine(isProspectSegmentType, { message: "Invalid segment" }),
})

export type SearchProspectsInput = z.infer<typeof searchProspectsSchema>

export const saveProspectsSchema = z.object({
  searchId: z.string().uuid(),
  googlePlaceIds: z.array(z.string().min(1).max(128)).max(60),
})

export type SaveProspectsInput = z.infer<typeof saveProspectsSchema>

export const listProspectsQuerySchema = z.object({
  status: z.enum(["prospect", "contacted", "discarded", "client", "all"]).optional(),
})

export type ListProspectsQuery = z.infer<typeof listProspectsQuerySchema>

export const prospectIdParamSchema = z.object({
  id: z.string().uuid(),
})

export const updateProspectStatusSchema = z.object({
  status: z.enum(["prospect", "contacted", "discarded", "client"]),
})

export type UpdateProspectStatusInput = z.infer<
  typeof updateProspectStatusSchema
>
