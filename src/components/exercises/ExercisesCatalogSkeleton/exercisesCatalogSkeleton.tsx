import { Skeleton } from "@/components/primitives/skeleton"

type ExercisesCatalogSkeletonProps = {
  viewMode?: "grid" | "list"
}

export function ExercisesCatalogSkeleton({
  viewMode = "grid",
}: ExercisesCatalogSkeletonProps) {
  return (
    <div className="space-y-4">
      <div className="flex gap-1 border-b border-border/70 pb-px">
        <Skeleton className="h-10 w-28 rounded-none" />
        <Skeleton className="h-10 w-24 rounded-none" />
      </div>

      {/* Mobile toolbar skeleton */}
      <div className="flex flex-col gap-3 md:hidden">
        <Skeleton className="h-10 w-full rounded-xl" />
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-24 rounded-xl" />
        </div>
      </div>

      {/* Desktop toolbar skeleton */}
      <div className="hidden overflow-hidden rounded-xl border border-border/80 md:block">
        <div className="flex flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center">
          <Skeleton className="h-8 min-w-0 flex-1 rounded-xl" />
          <Skeleton className="h-8 w-36 rounded-xl" />
          <Skeleton className="h-8 w-36 rounded-xl" />
          <div className="flex items-center gap-2 sm:ms-auto">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-16 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Mobile list skeleton */}
      <div className="flex flex-col gap-2.5 md:hidden">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-3 rounded-xl border border-border/80 p-2.5"
          >
            <Skeleton className="size-[4.5rem] shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-3.5 w-[70%]" />
              <Skeleton className="h-3 w-[40%]" />
              <Skeleton className="h-5 w-16 rounded-md" />
            </div>
          </div>
        ))}
      </div>

      {/* Desktop content skeleton */}
      <div className="hidden md:block">
        {viewMode === "list" ? (
          <div className="overflow-hidden rounded-xl border border-border/80">
            <div className="flex items-center gap-3 border-b px-3 py-3">
              <Skeleton className="size-10 rounded-lg" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="ms-auto size-4 rounded" />
            </div>
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center gap-3 border-b px-3 py-2.5 last:border-b-0"
              >
                <Skeleton className="size-10 shrink-0 rounded-lg" />
                <Skeleton className="h-3.5 w-36 max-w-[30%]" />
                <Skeleton className="h-3 w-24 max-w-[20%]" />
                <Skeleton className="h-3 w-20 max-w-[16%]" />
                <Skeleton className="ms-auto size-6 shrink-0 rounded-lg" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-xl border border-border/80"
              >
                <Skeleton className="aspect-[16/10] w-full rounded-none" />
                <div className="space-y-2 px-3 py-3">
                  <Skeleton className="h-3.5 w-[75%]" />
                  <Skeleton className="h-3 w-[45%]" />
                  <Skeleton className="h-5 w-16 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
