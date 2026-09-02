import { startWorkoutSessionAction } from "@/app/actions/workoutSessions"
import { toast } from "@/components/primitives/toast"
import { liveHref } from "@/components/workouts/shared/workoutUrlState"
import type { PlanWorkout } from "@/components/workouts/shared/types"

export async function startOrResumeWorkoutSession(
  workout: PlanWorkout,
  navigate: (href: string) => void
): Promise<void> {
  if (workout.activeSessionId) {
    navigate(liveHref(workout.activeSessionId))
    return
  }

  const result = await startWorkoutSessionAction(workout.id)
  if (result.ok) {
    navigate(liveHref(result.session.id))
    return
  }
  if (result.inProgressSessionId) {
    navigate(liveHref(result.inProgressSessionId))
    return
  }
  toast.add({ type: "error", title: result.error })
}
