import type { Metadata } from "next"

import { PushNotificationSettings } from "@/components/pwa/PushNotificationSettings"
import { PwaInstallHelp } from "@/components/pwa/PwaInstallHelp"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/primitives/card"

export const metadata: Metadata = {
  title: "Notificações",
}

export default function NotificationsPage() {
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col px-5 py-8 sm:px-8 md:py-12 lg:px-12">
      <section className="max-w-2xl border-b pb-9">
        <p className="text-[0.65rem] font-semibold tracking-[0.18em] text-primary uppercase">
          Preferências
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-balance sm:text-4xl">
          Notificações
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
          Controle as notificações push deste dispositivo.
        </p>
      </section>

      <Card className="mt-8 max-w-2xl">
        <CardHeader>
          <CardTitle>Push do navegador</CardTitle>
          <CardDescription>
            As permissões são individuais por navegador e dispositivo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {vapidPublicKey ? (
            <PushNotificationSettings vapidPublicKey={vapidPublicKey} />
          ) : (
            <p className="text-sm leading-6 text-muted-foreground">
              As chaves VAPID ainda não foram configuradas no ambiente.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="mt-4 max-w-2xl">
        <CardHeader>
          <CardTitle>Instalação</CardTitle>
          <CardDescription>
            Instale o Zamai.OS para abri-lo como um app no dispositivo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PwaInstallHelp />
        </CardContent>
      </Card>
    </div>
  )
}
