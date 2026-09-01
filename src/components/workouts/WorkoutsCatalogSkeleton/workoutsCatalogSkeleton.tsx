import { Skeleton } from "@/components/primitives/skeleton"

export function WorkoutsCatalogSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full max-w-sm rounded-xl" />
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="rounded-xl border border-border/80 bg-card/40 p-4"
          >
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="mt-3 h-3 w-24" />
            <div className="mt-4 flex gap-1.5">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <Skeleton className="mt-4 h-4 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
