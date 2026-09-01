import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { WorkoutSession } from "@/components/workouts/WorkoutSession"
import { workoutSessionCopy } from "@/components/workouts/shared/constants"
import { WorkoutSessionService } from "@/server/modules/workouts"

type WorkoutSessionPageProps = {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = {
  title: workoutSessionCopy.liveTitle,
}

export default async function WorkoutSessionPage({
  params,
}: WorkoutSessionPageProps) {
  const { id } = await params
  const session = await WorkoutSessionService.getSessionById(id)
  if (!session) notFound()

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col px-5 py-6 sm:px-8 md:py-8 lg:px-12">
      <WorkoutSession session={session} />
    </div>
  )
}
