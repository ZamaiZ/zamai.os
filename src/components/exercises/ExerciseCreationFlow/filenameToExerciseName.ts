export function filenameToExerciseName(fileName: string): string {
  const withoutExt = fileName.replace(/\.[^.]+$/u, "")
  return withoutExt.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim()
}
