export type CastMember = {
  id: string
  name: string
  handle: string
  color: string
  avatarUrl: string // uploaded image (data URL); falls back to initials when empty
  badge: "" | "BOT" | "ADMIN" | "MOD" | "OP"
}

export type EventType = "message" | "join" | "leave" | "reaction"

export type StoryEvent = {
  id: string
  type: EventType
  userId: string
  text: string
  emoji: string // for reaction events
  timing: "auto" | number // ms override for typing
  timestamp: string // display label e.g. "9:03 AM"
}

export type Settings = {
  visibleWindow: number
  background: string
  aspect: "9:16" | "1:1" | "16:9"
  channel: string
  // "stack": messages accumulate like a normal chat.
  // "solo": one message on screen at a time, vertically centered.
  mode: "stack" | "solo"
  // horizontal alignment of messages on the chat surface
  align: "left" | "center"
  // typing-speed multiplier: 1 = normal, 2 = twice as fast (shorter typing)
  typingSpeed: number
  // gap between messages multiplier: 1 = normal, 2 = twice as fast (shorter gap)
  intervalSpeed: number
}

export type TimedEvent = StoryEvent & {
  typingStart: number
  typingEnd: number
  revealAt: number
  end: number
}
