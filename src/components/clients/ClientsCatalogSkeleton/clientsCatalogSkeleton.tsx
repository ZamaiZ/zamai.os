import { Skeleton } from "@/components/primitives/skeleton"

export function ClientsCatalogSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border/80 bg-card">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-3 border-b border-border/70 px-4 py-3 last:border-b-0"
        >
          <Skeleton className="size-4 shrink-0 rounded-[6px]" />
          <Skeleton className="size-9 shrink-0 rounded-lg" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3.5 w-[48%]" />
            <Skeleton className="h-3 w-[72%]" />
          </div>
          <Skeleton className="hidden size-8 rounded-lg sm:block" />
          <Skeleton className="hidden size-8 rounded-lg sm:block" />
        </div>
      ))}
    </div>
  )
}
