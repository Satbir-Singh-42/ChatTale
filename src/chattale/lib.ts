import type { CastMember, Settings, StoryEvent, TimedEvent } from "./types"

export const uid = () => Math.random().toString(36).slice(2, 9)

export const DISCORD_COLORS = [
  "#5865f2",
  "#eb459e",
  "#57f287",
  "#fee75c",
  "#ed4245",
  "#00b0f4",
  "#f47b67",
  "#a652bb",
  "#f8a532",
  "#3ba55d",
]

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function findMember(cast: CastMember[], id: string) {
  return cast.find((c) => c.id === id)
}

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v))

// Auto typing feels human: scaled to length, with min/max caps.
// `speed` shortens the typing phase (2 = twice as fast); manual ms overrides
// are also scaled so the speed control stays meaningful across all beats.
export function typingDuration(ev: StoryEvent, speed = 1) {
  const s = speed > 0 ? speed : 1
  if (typeof ev.timing === "number") return ev.timing / s
  const len = ev.text.length
  return clamp(500 + len * 42, 800, 3600) / s
}

export function readDuration(ev: StoryEvent) {
  if (ev.type === "message") return clamp(700 + ev.text.length * 28, 950, 3200)
  return 1100
}

// Total on-screen time an event occupies (typing + read), for editor badges.
export function eventDuration(ev: StoryEvent, speed = 1, intervalSpeed = 1) {
  const read = readDuration(ev) / intervalSpeed
  if (ev.type === "message") return typingDuration(ev, speed) + read
  return read
}

export function buildTimeline(
  events: StoryEvent[],
  speed = 1,
  intervalSpeed = 1,
): {
  timed: TimedEvent[]
  total: number
} {
  let cursor = 400 / intervalSpeed
  const timed: TimedEvent[] = events.map((ev) => {
    if (ev.type === "message") {
      const typingStart = cursor
      const typingEnd = typingStart + typingDuration(ev, speed)
      const revealAt = typingEnd
      const end = revealAt + readDuration(ev) / intervalSpeed
      cursor = end
      return { ...ev, typingStart, typingEnd, revealAt, end }
    }
    const revealAt = cursor
    const end = revealAt + readDuration(ev) / intervalSpeed
    cursor = end
    return { ...ev, typingStart: revealAt, typingEnd: revealAt, revealAt, end }
  })
  return { timed, total: cursor + 600 / intervalSpeed }
}

export function fmtTime(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`
}

// Parse quick-add shorthand into events, creating cast members as needed.
export function parseScript(
  raw: string,
  cast: CastMember[],
): { events: StoryEvent[], cast: CastMember[] } {
  const nextCast = [...cast]
  const events: StoryEvent[] = []
  let colorIdx = nextCast.length

  const ensure = (name: string): CastMember => {
    const existing = nextCast.find(
      (c) => c.name.toLowerCase() === name.toLowerCase(),
    )
    if (existing) return existing
    const m: CastMember = {
      id: uid(),
      name,
      handle: name.toLowerCase().replace(/\s+/g, ""),
      color: DISCORD_COLORS[colorIdx++ % DISCORD_COLORS.length],
      avatarUrl: "",
      badge: "",
    }
    nextCast.push(m)
    return m
  }

  for (const line of raw.split("\n")) {
    const t = line.trim()
    if (!t) continue
    const sys = t.match(/^\[(.+?)\s+(joins|joined|left|leaves|leave)\]$/i)
    if (sys) {
      const m = ensure(sys[1])
      const leaving = /le/i.test(sys[2])
      events.push({
        id: uid(),
        type: leaving ? "leave" : "join",
        userId: m.id,
        text: "",
        emoji: "",
        timing: "auto",
        timestamp: "",
      })
      continue
    }
    const msg = t.match(/^([^:]{1,32}):\s*(.+)$/)
    if (msg) {
      const m = ensure(msg[1].trim())
      events.push({
        id: uid(),
        type: "message",
        userId: m.id,
        text: msg[2].trim(),
        emoji: "",
        timing: "auto",
        timestamp: "",
      })
    }
  }
  return { events, cast: nextCast }
}

export const defaultSettings: Settings = {
  visibleWindow: 3,
  background: "#313338",
  aspect: "9:16",
  channel: "your-channel",
  mode: "stack",
  align: "left",
  typingSpeed: 1,
  intervalSpeed: 1,
}
