import type { CastMember, Settings, StoryEvent } from "./types"

const KEY = "chattale.project.v1"

export type Project = {
  cast: CastMember[]
  events: StoryEvent[]
  settings: Settings
  step: string
}

/**
 * localStorage is best-effort: private-mode Safari throws on `setItem`, and a
 * stale entry from an older build can fail schema checks. Every read is
 * validated and every failure degrades to "no saved project" rather than
 * taking the app down on boot.
 */
function safeStorage(): Storage | null {
  try {
    const s = window.localStorage
    const probe = KEY + ".probe"
    s.setItem(probe, "1")
    s.removeItem(probe)
    return s
  } catch {
    return null
  }
}

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null

export function loadProject(): Project | null {
  const s = safeStorage()
  if (!s) return null
  try {
    const raw = s.getItem(KEY)
    if (!raw) return null
    const p: unknown = JSON.parse(raw)
    if (!isObject(p)) return null
    if (!Array.isArray(p.cast) || !Array.isArray(p.events)) return null
    if (!isObject(p.settings)) return null
    return {
      cast: p.cast as CastMember[],
      events: p.events as StoryEvent[],
      settings: p.settings as Settings,
      step: typeof p.step === "string" ? p.step : "home",
    }
  } catch {
    return null
  }
}

export function saveProject(project: Project): boolean {
  const s = safeStorage()
  if (!s) return false
  try {
    s.setItem(KEY, JSON.stringify(project))
    return true
  } catch {
    // Quota exceeded — avatars are the usual culprit. Drop the save rather
    // than interrupting the user's typing with an error.
    return false
  }
}

export function clearProject(): void {
  const s = safeStorage()
  if (!s) return
  try {
    s.removeItem(KEY)
  } catch {
    /* nothing to do */
  }
}
