import { startWorkoutSessionAction } from "@/app/actions/workoutSessions"
import { toast } from "@/components/primitives/toast"
import type { PlanWorkout } from "@/components/workouts/shared/types"

export async function startOrResumeWorkoutSession(
  workout: PlanWorkout,
  navigate: (href: string) => void
): Promise<void> {
  if (workout.activeSessionId) {
    navigate(`/lifestyle/workouts/sessions/${workout.activeSessionId}`)
    return
  }

  const result = await startWorkoutSessionAction(workout.id)
  if (result.ok) {
    navigate(`/lifestyle/workouts/sessions/${result.session.id}`)
    return
  }
  if (result.inProgressSessionId) {
    navigate(`/lifestyle/workouts/sessions/${result.inProgressSessionId}`)
    return
  }
  toast.add({ type: "error", title: result.error })
}
