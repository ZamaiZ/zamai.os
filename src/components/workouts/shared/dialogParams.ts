const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export type WorkoutDialogState =
  | { kind: "closed" }
  | { kind: "create" }
  | { kind: "edit"; id: string }
  | { kind: "view"; id: string }

type DialogRouter = {
  replace: (href: string, options?: { scroll?: boolean }) => void
}

function isUuid(value: string) {
  return UUID_PATTERN.test(value)
}

export function parseWorkoutDialog(
  searchParams: URLSearchParams | { get: (key: string) => string | null }
): WorkoutDialogState {
  if (searchParams.get("create") === "1") {
    return { kind: "create" }
  }

  const edit = searchParams.get("edit")
  if (edit && isUuid(edit)) {
    return { kind: "edit", id: edit }
  }

  const view = searchParams.get("view")
  if (view && isUuid(view)) {
    return { kind: "view", id: view }
  }

  return { kind: "closed" }
}

export function replaceWorkoutDialog(
  router: DialogRouter,
  pathname: string,
  currentParams: URLSearchParams | { toString: () => string },
  next: WorkoutDialogState
) {
  const params = new URLSearchParams(currentParams.toString())
  params.delete("create")
  params.delete("edit")
  params.delete("view")

  if (next.kind === "create") {
    params.set("create", "1")
  } else if (next.kind === "edit") {
    params.set("edit", next.id)
  } else if (next.kind === "view") {
    params.set("view", next.id)
  }

  const query = params.toString()
  router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
}
