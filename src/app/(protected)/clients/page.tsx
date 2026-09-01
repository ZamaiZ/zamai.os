import type { Metadata } from "next"

import { ClientsCatalog } from "@/components/clients"
import { clientsCatalogCopy } from "@/components/clients/shared/constants"
import { ProspectService } from "@/server/modules/prospects"

export const metadata: Metadata = {
  title: clientsCatalogCopy.title,
}

export const maxDuration = 60

export default async function ClientsPage() {
  const prospects = await ProspectService.listProspects({ status: "all" })

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col px-5 py-6 sm:px-8 md:py-8 lg:px-12">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 max-w-2xl">
          <p className="text-[0.65rem] font-semibold tracking-[0.18em] text-primary uppercase">
            {clientsCatalogCopy.eyebrow}
          </p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-[-0.03em] text-balance">
            {clientsCatalogCopy.title}
          </h1>
          <p className="mt-1.5 max-w-xl text-sm leading-5 text-muted-foreground">
            {clientsCatalogCopy.description}
          </p>
        </div>
      </section>

      <div className="mt-6">
        <ClientsCatalog prospects={prospects} />
      </div>
    </div>
  )
}
