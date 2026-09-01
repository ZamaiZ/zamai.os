import Link from "next/link"

import { workoutSessionCopy } from "@/components/workouts/shared/constants"
import { buttonVariants } from "@/components/primitives/button"
import { cn } from "@/lib/utils"

export default function WorkoutSessionNotFound() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-4 px-5 py-16 text-center">
      <h1 className="text-xl font-semibold">{workoutSessionCopy.missingTitle}</h1>
      <p className="text-sm text-muted-foreground">
        {workoutSessionCopy.missingDescription}
      </p>
      <Link
        href="/lifestyle/workouts/plans"
        className={cn(buttonVariants())}
      >
        {workoutSessionCopy.backToPlans}
      </Link>
    </div>
  )
}
