import { WorkoutSessionSkeleton } from "@/components/workouts/WorkoutSessionSkeleton"

export default function WorkoutSessionLoading() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col px-5 py-6 sm:px-8 md:py-8 lg:px-12">
      <WorkoutSessionSkeleton />
    </div>
  )
}
