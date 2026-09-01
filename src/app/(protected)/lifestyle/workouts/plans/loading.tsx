import { Skeleton } from "@/components/primitives/skeleton"
import { WorkoutsCatalogSkeleton } from "@/components/workouts/WorkoutsCatalogSkeleton"

export default function WorkoutPlansLoading() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col px-5 py-6 sm:px-8 md:py-8 lg:px-12">
      <Skeleton className="mb-6 h-8 w-40" />
      <WorkoutsCatalogSkeleton />
    </div>
  )
}
