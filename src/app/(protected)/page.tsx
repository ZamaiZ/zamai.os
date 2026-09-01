import Link from "next/link"
import type { Metadata } from "next"
import { ArrowUpRightIcon, CommandIcon, PanelsTopLeftIcon } from "@/components/icons"

export const metadata: Metadata = {
  title: "Início",
}

export default function Page() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col px-5 py-8 sm:px-8 md:py-12 lg:px-12">
      <section className="max-w-2xl border-b pb-9">
        <p className="text-[0.65rem] font-semibold tracking-[0.18em] text-primary uppercase">
          Visão geral
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-balance sm:text-4xl">
          Seu espaço pessoal.
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
          Um ponto de partida limpo para organizar o que faz parte da sua vida.
        </p>
      </section>

      <section aria-labelledby="quick-access-title" className="pt-9">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Acesso rápido</p>
            <h2 id="quick-access-title" className="mt-1 text-lg font-semibold tracking-tight">
              Explore o Zamai.OS
            </h2>
          </div>
          <span className="hidden text-xs text-muted-foreground sm:inline">
            2 recursos
          </span>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Link
            href="/showcase"
            className="group flex min-h-36 flex-col justify-between rounded-xl border bg-card/45 p-5 transition-[background-color,border-color,transform] duration-150 ease-out hover:border-primary/30 hover:bg-card active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none"
          >
            <div className="flex items-start justify-between gap-4">
              <span className="grid size-9 place-items-center rounded-lg border bg-background text-muted-foreground transition-colors group-hover:text-primary">
                <PanelsTopLeftIcon aria-hidden className="size-4" />
              </span>
              <ArrowUpRightIcon aria-hidden className="size-4 text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Showcase</h3>
              <p className="mt-1 text-sm leading-5 text-muted-foreground">
                Componentes, padrões e estados visuais da aplicação.
              </p>
            </div>
          </Link>

          <div className="flex min-h-36 flex-col justify-between rounded-xl border border-dashed bg-muted/20 p-5">
            <span className="grid size-9 place-items-center rounded-lg border bg-background text-muted-foreground">
              <CommandIcon aria-hidden className="size-4" />
            </span>
            <div>
              <h3 className="text-sm font-semibold">Atalhos do shell</h3>
              <p className="mt-1 text-sm leading-5 text-muted-foreground">
                Use Ctrl+B para a navegação e Ctrl+Alt+T para alternar o tema.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
