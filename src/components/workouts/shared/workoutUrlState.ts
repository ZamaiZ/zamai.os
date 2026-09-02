const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const WORKOUT_PLANS_PATH = "/lifestyle/workouts/plans"

export type WorkoutDialogState =
  | { kind: "closed" }
  | { kind: "create" }
  | { kind: "edit"; id: string }
  | { kind: "view"; id: string }

export type WorkoutHistoryFilter =
  | { kind: "all" }
  | { kind: "workout"; workoutId: string }

export type WorkoutUrlState = {
  plan: WorkoutDialogState
  liveSessionId: string | null
  detailSessionId: string | null
  history: WorkoutHistoryFilter | null
}

type DialogRouter = {
  replace: (href: string, options?: { scroll?: boolean }) => void
}

function isUuid(value: string) {
  return UUID_PATTERN.test(value)
}

export function emptyWorkoutUrlState(): WorkoutUrlState {
  return {
    plan: { kind: "closed" },
    liveSessionId: null,
    detailSessionId: null,
    history: null,
  }
}

export function parseWorkoutUrlState(
  searchParams: URLSearchParams | { get: (key: string) => string | null }
): WorkoutUrlState {
  const live = searchParams.get("live")
  const session = searchParams.get("session")
  const history = searchParams.get("history")

  let plan: WorkoutDialogState = { kind: "closed" }
  if (searchParams.get("create") === "1") {
    plan = { kind: "create" }
  } else {
    const edit = searchParams.get("edit")
    if (edit && isUuid(edit)) {
      plan = { kind: "edit", id: edit }
    } else {
      const view = searchParams.get("view")
      if (view && isUuid(view)) {
        plan = { kind: "view", id: view }
      }
    }
  }

  return {
    plan,
    liveSessionId: live && isUuid(live) ? live : null,
    detailSessionId: session && isUuid(session) ? session : null,
    history:
      history === "all"
        ? { kind: "all" }
        : history && isUuid(history)
          ? { kind: "workout", workoutId: history }
          : null,
  }
}

export function parseWorkoutDialog(
  searchParams: URLSearchParams | { get: (key: string) => string | null }
): WorkoutDialogState {
  return parseWorkoutUrlState(searchParams).plan
}

function writeWorkoutUrlState(state: WorkoutUrlState): URLSearchParams {
  const params = new URLSearchParams()

  if (state.liveSessionId) {
    params.set("live", state.liveSessionId)
    return params
  }

  if (state.history?.kind === "all") {
    params.set("history", "all")
  } else if (state.history?.kind === "workout") {
    params.set("history", state.history.workoutId)
  }

  if (state.detailSessionId) {
    params.set("session", state.detailSessionId)
  }

  if (state.plan.kind === "create") {
    params.set("create", "1")
  } else if (state.plan.kind === "edit") {
    params.set("edit", state.plan.id)
  } else if (state.plan.kind === "view") {
    params.set("view", state.plan.id)
  }

  return params
}

export function replaceWorkoutUrlState(
  router: DialogRouter,
  pathname: string,
  next: WorkoutUrlState
) {
  const query = writeWorkoutUrlState(next).toString()
  router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
}

export function replaceWorkoutDialog(
  router: DialogRouter,
  pathname: string,
  currentParams: URLSearchParams | { toString: () => string },
  next: WorkoutDialogState
) {
  const current = parseWorkoutUrlState(
    currentParams instanceof URLSearchParams
      ? currentParams
      : new URLSearchParams(currentParams.toString())
  )
  replaceWorkoutUrlState(router, pathname, { ...current, plan: next })
}

export function liveHref(sessionId: string) {
  return `${WORKOUT_PLANS_PATH}?live=${sessionId}`
}

export function withLive(state: WorkoutUrlState, sessionId: string): WorkoutUrlState {
  return {
    plan: { kind: "closed" },
    liveSessionId: sessionId,
    detailSessionId: null,
    history: null,
  }
}

export function withCompletedSession(
  state: WorkoutUrlState,
  sessionId: string
): WorkoutUrlState {
  return {
    ...state,
    plan: { kind: "closed" },
    liveSessionId: null,
    detailSessionId: sessionId,
  }
}

export function withHistory(
  filter: WorkoutHistoryFilter
): WorkoutUrlState {
  return {
    plan: { kind: "closed" },
    liveSessionId: null,
    detailSessionId: null,
    history: filter,
  }
}

export function withHistorySession(
  state: WorkoutUrlState,
  sessionId: string
): WorkoutUrlState {
  return {
    ...state,
    liveSessionId: null,
    detailSessionId: sessionId,
    plan: { kind: "closed" },
  }
}

export function closeSessionKeepHistory(state: WorkoutUrlState): WorkoutUrlState {
  return { ...state, detailSessionId: null }
}
