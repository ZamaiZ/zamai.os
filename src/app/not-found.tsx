import type { Metadata } from "next"

import { NotFoundScreen } from "@/components/errors/NotFoundScreen"
import { notFoundCopy } from "@/components/errors/NotFoundScreen/constants"
import { getUser } from "@/lib/auth/session"

export const metadata: Metadata = {
  title: "Não encontrada",
}

export default async function NotFound() {
  const user = await getUser()

  return (
    <>
      {/* Layout notFound() keeps page metadata; override title. */}
      <title>Não encontrada | Zamai.OS</title>
      <NotFoundScreen
        ctaHref={user ? "/" : "/login"}
        ctaLabel={user ? notFoundCopy.ctaHome : notFoundCopy.ctaLogin}
      />
    </>
  )
}
