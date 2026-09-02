"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import {
  completeWorkoutSessionAction,
  discardWorkoutSessionAction,
  patchWorkoutSessionSetAction,
  skipWorkoutSessionExerciseAction,
} from "@/app/actions/workoutSessions"
import { WorkoutSessionExerciseCard } from "@/components/workouts/WorkoutSessionExerciseCard"
import { workoutSessionCopy } from "@/components/workouts/shared/constants"
import { MoreHorizontalIcon, TrashIcon } from "@/components/icons"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/primitives/alertDialog"
import { Button } from "@/components/primitives/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/primitives/dropdownMenu"
import { Input } from "@/components/primitives/input"
import { Label } from "@/components/primitives/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/primitives/sheet"
import { Spinner } from "@/components/primitives/spinner"
import { toast } from "@/components/primitives/toast"
import {
  getRestAudioContext,
  startRestAlarm,
  stopRestAlarm,
} from "@/lib/workouts/restAlarm"
import { formatElapsedClock } from "@/lib/workouts/sessionFormat"
import { getProtocolSlot } from "@/lib/workouts/setProtocol"
import type {
  WorkoutSessionDto,
  WorkoutSessionSetDto,
} from "@/lib/workouts/session.types"
import { cn } from "@/lib/utils"

type Draft = { weight: string; reps: string }

type RestState = {
  remaining: number
  total: number
  nextLabel: string
  token: number
}

function setKey(set: Pick<WorkoutSessionSetDto, "exerciseIndex" | "slot">) {
  return `${set.exerciseIndex}:${set.slot}`
}

function draftsFromSession(session: WorkoutSessionDto): Record<string, Draft> {
  const drafts: Record<string, Draft> = {}
  for (const set of session.sets) {
    const weight =
      set.weightKg != null
        ? String(set.weightKg)
        : set.status === "pending" && set.previous
          ? String(set.previous.weightKg)
          : ""
    drafts[setKey(set)] = {
      weight,
      reps: set.reps != null ? String(set.reps) : "",
    }
  }
  return drafts
}

function parseWeight(value: string): number | null {
  const parsed = Number(value.trim().replace(",", "."))
  if (!Number.isFinite(parsed) || parsed < 0) return null
  return parsed
}

function parseReps(value: string): number | null {
  const parsed = Number.parseInt(value.trim(), 10)
  if (!Number.isFinite(parsed) || parsed < 1) return null
  return parsed
}

function parseOptionalPositive(value: string): number | undefined | false {
  const trimmed = value.trim()
  if (!trimmed) return undefined
  const parsed = Number.parseInt(trimmed, 10)
  if (!Number.isFinite(parsed) || parsed < 1) return false
  return parsed
}

function firstPendingSet(session: WorkoutSessionDto) {
  return session.sets.find((set) => set.status === "pending")
}

function firstPendingExerciseIndex(session: WorkoutSessionDto) {
  return (
    firstPendingSet(session)?.exerciseIndex ??
    session.exercises[0]?.exerciseIndex ??
    0
  )
}

function nextSetLabel(session: WorkoutSessionDto, from: WorkoutSessionSetDto) {
  const next = session.sets.find(
    (set) =>
      set.status === "pending" &&
      (set.exerciseIndex > from.exerciseIndex ||
        (set.exerciseIndex === from.exerciseIndex && set.slot > from.slot))
  )
  if (!next) return workoutSessionCopy.restNextSet
  if (next.exerciseIndex !== from.exerciseIndex) {
    const exercise = session.exercises.find(
      (item) => item.exerciseIndex === next.exerciseIndex
    )
    return exercise
      ? `Próximo: ${exercise.name}`
      : workoutSessionCopy.restNextSet
  }
  return `${workoutSessionCopy.restNextSet} · ${next.slot}`
}

type WorkoutSessionProps = {
  session: WorkoutSessionDto
  onComplete: (sessionId: string) => void
  onDiscarded: () => void
}

export function WorkoutSession({
  session: initialSession,
  onComplete,
  onDiscarded,
}: WorkoutSessionProps) {
  const router = useRouter()
  const reduceMotion = useReducedMotion()
  const [session, setSession] = React.useState(initialSession)
  const [drafts, setDrafts] = React.useState(() => draftsFromSession(initialSession))
  const [pendingKeys, setPendingKeys] = React.useState<Set<string>>(new Set())
  const [rest, setRest] = React.useState<RestState | null>(null)
  const [activeExerciseIndex, setActiveExerciseIndex] = React.useState(() =>
    firstPendingExerciseIndex(initialSession)
  )
  const [elapsed, setElapsed] = React.useState(0)
  const [finishOpen, setFinishOpen] = React.useState(false)
  const [discardOpen, setDiscardOpen] = React.useState(false)
  const [calories, setCalories] = React.useState("")
  const [heartRate, setHeartRate] = React.useState("")
  const [finishing, setFinishing] = React.useState(false)
  const [discarding, setDiscarding] = React.useState(false)
  const [skippingExercise, setSkippingExercise] = React.useState<number | null>(
    null
  )
  const alarmStartedRef = React.useRef(false)
  const pendingFocusRef = React.useRef<string | null>(null)

  React.useEffect(() => {
    const tick = () => {
      setElapsed(
        Math.max(
          0,
          Math.floor((Date.now() - Date.parse(session.startedAt)) / 1000)
        )
      )
    }
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [session.startedAt])

  React.useEffect(() => {
    if (!rest || rest.remaining <= 0) return
    alarmStartedRef.current = false
    stopRestAlarm()
    const id = window.setInterval(() => {
      setRest((current) => {
        if (!current || current.remaining <= 0) return current
        if (current.remaining <= 1) {
          window.clearInterval(id)
          return { ...current, remaining: 0 }
        }
        return { ...current, remaining: current.remaining - 1 }
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [rest?.token])

  React.useEffect(() => {
    if (!rest || rest.remaining > 0 || alarmStartedRef.current) return
    alarmStartedRef.current = true
    startRestAlarm()
  }, [rest])

  React.useEffect(() => {
    return () => stopRestAlarm()
  }, [])

  React.useEffect(() => {
    if (rest) return
    const field = pendingFocusRef.current
    if (!field) return
    pendingFocusRef.current = null
    const timeout = window.setTimeout(() => {
      document
        .querySelector<HTMLInputElement>(`[data-session-field="${field}"]`)
        ?.focus()
    }, 80)
    return () => window.clearTimeout(timeout)
  }, [rest, activeExerciseIndex])

  function clearRest() {
    stopRestAlarm()
    alarmStartedRef.current = false
    setRest(null)
  }

  function dismissRest() {
    const next = firstPendingSet(session)
    if (next) {
      const key = setKey(next)
      const draft = drafts[key]
      const field = !draft?.weight.trim() ? "weight" : "reps"
      pendingFocusRef.current = `${key}-${field}`
      setActiveExerciseIndex(next.exerciseIndex)
    }
    clearRest()
  }

  function markBusy(key: string, busy: boolean) {
    setPendingKeys((current) => {
      const next = new Set(current)
      if (busy) next.add(key)
      else next.delete(key)
      return next
    })
  }

  async function mutateSet(
    set: WorkoutSessionSetDto,
    input: {
      status: "pending" | "completed" | "skipped"
      weightKg?: number
      reps?: number
    },
    startRest: boolean
  ) {
    const key = setKey(set)
    markBusy(key, true)
    const result = await patchWorkoutSessionSetAction({
      sessionId: session.id,
      exerciseIndex: set.exerciseIndex,
      slot: set.slot,
      ...input,
    })
    markBusy(key, false)
    if (!result.ok) {
      toast.add({ type: "error", title: result.error })
      return
    }
    setSession(result.session)
    setDrafts(draftsFromSession(result.session))
    const stillPending = result.session.sets.some((item) => item.status === "pending")
    if (startRest && stillPending) {
      const protocol = getProtocolSlot(set.slot)
      setRest({
        remaining: protocol.restAfterSeconds,
        total: protocol.restAfterSeconds,
        nextLabel: nextSetLabel(result.session, set),
        token: Date.now(),
      })
    }
  }

  async function handleComplete(set: WorkoutSessionSetDto) {
    const draft = drafts[setKey(set)]
    if (!draft) return
    const weightKg = parseWeight(draft.weight)
    const reps = parseReps(draft.reps)
    if (weightKg === null || reps === null) return
    getRestAudioContext()
    await mutateSet(set, { status: "completed", weightKg, reps }, true)
  }

  async function handleSkipExercise(exerciseIndex: number) {
    setSkippingExercise(exerciseIndex)
    const result = await skipWorkoutSessionExerciseAction({
      sessionId: session.id,
      exerciseIndex,
    })
    setSkippingExercise(null)
    if (!result.ok) {
      toast.add({ type: "error", title: result.error })
      return
    }
    setSession(result.session)
    setDrafts(draftsFromSession(result.session))
    clearRest()
    const next = firstPendingSet(result.session)
    setActiveExerciseIndex(
      next?.exerciseIndex ??
        result.session.exercises[result.session.exercises.length - 1]
          ?.exerciseIndex ??
        0
    )
  }

  async function handleFinish() {
    const caloriesValue = parseOptionalPositive(calories)
    const hrValue = parseOptionalPositive(heartRate)
    if (caloriesValue === false || hrValue === false) {
      toast.add({
        type: "error",
        title: "Calorias e FC precisam ser números positivos.",
      })
      return
    }
    setFinishing(true)
    const result = await completeWorkoutSessionAction({
      sessionId: session.id,
      calories: caloriesValue,
      avgHeartRate: hrValue,
    })
    setFinishing(false)
    if (!result.ok) {
      toast.add({ type: "error", title: result.error })
      return
    }
    setFinishOpen(false)
    clearRest()
    onComplete(result.session.id)
    router.refresh()
  }

  async function handleDiscard() {
    setDiscarding(true)
    const result = await discardWorkoutSessionAction(session.id)
    setDiscarding(false)
    if (!result.ok) {
      toast.add({ type: "error", title: result.error })
      return
    }
    clearRest()
    onDiscarded()
    router.refresh()
  }

  const completedSets = session.sets.filter((set) => set.status === "completed").length
  const plannedSets = session.metrics.plannedSets
  const activeExercise =
    session.exercises.find((item) => item.exerciseIndex === activeExerciseIndex) ??
    session.exercises[0]
  const upcoming = session.exercises.find(
    (item) => item.exerciseIndex === (activeExercise?.exerciseIndex ?? 0) + 1
  )

  if (!activeExercise) {
    return null
  }

  return (
    <div className="mx-auto w-full max-w-lg">
      <header className="mb-5">
        <p className="text-[0.65rem] font-semibold tracking-[0.18em] text-primary uppercase">
          {workoutSessionCopy.eyebrow}
        </p>
        <div className="mt-1.5 flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-semibold tracking-tight text-balance">
              {session.workoutName}
            </h1>
            <p className="mt-1 font-mono text-sm tabular-nums text-muted-foreground">
              {formatElapsedClock(elapsed)} ·{" "}
              {workoutSessionCopy.progress(completedSets, plannedSets)}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              type="button"
              size="sm"
              disabled={finishing || discarding}
              onClick={() => setFinishOpen(true)}
            >
              {workoutSessionCopy.finishShort}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={workoutSessionCopy.sessionMenu}
                  />
                }
              >
                <MoreHorizontalIcon aria-hidden />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => setDiscardOpen(true)}
                  >
                    <TrashIcon aria-hidden />
                    {workoutSessionCopy.discard}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <nav
        aria-label={workoutSessionCopy.exerciseStepper}
        className="mb-4 flex flex-wrap gap-1.5"
      >
        {session.exercises.map((exercise) => {
          const sets = session.sets.filter(
            (set) => set.exerciseIndex === exercise.exerciseIndex
          )
          const isActive = exercise.exerciseIndex === activeExercise.exerciseIndex
          const hasPending = sets.some((set) => set.status === "pending")
          const skipped =
            sets.length > 0 && sets.every((set) => set.status === "skipped")
          return (
            <button
              key={exercise.exerciseIndex}
              type="button"
              aria-current={isActive ? "true" : undefined}
              aria-label={exercise.name}
              disabled={rest !== null}
              onClick={() => setActiveExerciseIndex(exercise.exerciseIndex)}
              className={cn(
                "flex size-8 items-center justify-center rounded-full text-[0.7rem] font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
                isActive && "bg-primary text-primary-foreground",
                !isActive && hasPending && "bg-muted text-foreground",
                !isActive && !hasPending && skipped && "bg-muted/40 text-muted-foreground",
                !isActive && !hasPending && !skipped && "bg-primary/15 text-primary"
              )}
            >
              {exercise.exerciseIndex + 1}
            </button>
          )
        })}
      </nav>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeExercise.exerciseIndex}
          initial={reduceMotion ? false : { opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, x: -14 }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
        >
          <WorkoutSessionExerciseCard
            exercise={activeExercise}
            sets={session.sets.filter(
              (set) => set.exerciseIndex === activeExercise.exerciseIndex
            )}
            drafts={drafts}
            pendingKeys={pendingKeys}
            rest={rest}
            disabled={skippingExercise !== null || finishing || discarding}
            skipping={skippingExercise === activeExercise.exerciseIndex}
            onDraftChange={(key, field, value) => {
              setDrafts((current) => ({
                ...current,
                [key]: {
                  weight: current[key]?.weight ?? "",
                  reps: current[key]?.reps ?? "",
                  [field]: value,
                },
              }))
            }}
            onComplete={(set) => void handleComplete(set)}
            onUndo={(set) => void mutateSet(set, { status: "pending" }, false)}
            onSkipSet={(set) => void mutateSet(set, { status: "skipped" }, false)}
            onSkipExercise={() =>
              void handleSkipExercise(activeExercise.exerciseIndex)
            }
            onDismissRest={dismissRest}
          />
        </motion.div>
      </AnimatePresence>

      {upcoming ? (
        <p className="mt-3 text-center text-[0.75rem] text-muted-foreground">
          {workoutSessionCopy.upNext(upcoming.name)}
        </p>
      ) : null}

      <Sheet open={finishOpen} onOpenChange={setFinishOpen}>
        <SheetContent side="bottom" className="mx-auto max-w-lg rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>{workoutSessionCopy.finishTitle}</SheetTitle>
            <SheetDescription>
              {workoutSessionCopy.finishDescription}
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 px-6">
            <div className="grid gap-2">
              <Label htmlFor="session-calories">
                {workoutSessionCopy.caloriesLabel}
              </Label>
              <Input
                id="session-calories"
                inputMode="numeric"
                value={calories}
                onChange={(event) => setCalories(event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="session-hr">
                {workoutSessionCopy.heartRateLabel}
              </Label>
              <Input
                id="session-hr"
                inputMode="numeric"
                value={heartRate}
                onChange={(event) => setHeartRate(event.target.value)}
              />
            </div>
          </div>
          <SheetFooter className="flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              disabled={finishing}
              onClick={() => setFinishOpen(false)}
            >
              {workoutSessionCopy.finishCancel}
            </Button>
            <Button
              type="button"
              className="flex-1"
              disabled={finishing}
              onClick={() => void handleFinish()}
            >
              {finishing ? (
                <>
                  <Spinner data-icon="inline-start" />
                  {workoutSessionCopy.finishing}
                </>
              ) : (
                workoutSessionCopy.finishConfirm
              )}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <AlertDialog open={discardOpen} onOpenChange={setDiscardOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{workoutSessionCopy.discardTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {workoutSessionCopy.discardDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={discarding}>
              {workoutSessionCopy.discardCancel}
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={discarding}
              onClick={(event) => {
                event.preventDefault()
                void handleDiscard()
              }}
            >
              {discarding
                ? workoutSessionCopy.discarding
                : workoutSessionCopy.discardConfirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
