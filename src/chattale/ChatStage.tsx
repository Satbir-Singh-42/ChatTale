import type { ReactNode } from "react"
import type { CastMember, Settings, TimedEvent } from "./types"
import { findMember, initials, autoTimestamp } from "./lib"
import { IconEnter, IconExit, IconSmile } from "./icons"

/**
 * Format message text with Discord mention pills and markdown:
 * - @everyone and @here: amber tag with pulse animation
 * - @username: blurple / role-colored tag with pulse animation
 * - #channel: channel tag
 * - **bold**: bold text
 * - *italic*: italic text
 * - `code`: inline monospace code block
 */
export function formatMessageText(
  text: string,
  cast: CastMember[] = [],
): ReactNode[] {
  if (!text) return []

  const regex =
    /(@(?:everyone|here)\b)|(@\[[^\]]+\]|@[\w.-]+)|(#[a-zA-Z0-9_-]+)|(\*\*[^*]+\*\*)|(\*[^*]+\*)|(`[^`]+`)/gi

  const parts: ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }

    const [full, everyone, userTag, channelTag, bold, italic, code] = match
    const key = `fmt-${match.index}-${full}`

    if (everyone) {
      parts.push(
        <span key={key} className="ct-tag-everyone">
          {full}
        </span>,
      )
    } else if (userTag) {
      const cleanName =
        userTag.startsWith("@[") && userTag.endsWith("]")
          ? "@" + userTag.slice(2, -1)
          : userTag

      const rawName = cleanName.slice(1).toLowerCase()
      const member = cast.find(
        (c) =>
          c.name.toLowerCase() === rawName ||
          c.name.toLowerCase().startsWith(rawName),
      )

      parts.push(
        <span
          key={key}
          className="ct-tag-mention"
          style={
            member?.color
              ? {
                  color: member.color,
                  borderColor: `${member.color}66`,
                  backgroundColor: `${member.color}25`,
                }
              : undefined
          }
        >
          {cleanName}
        </span>,
      )
    } else if (channelTag) {
      parts.push(
        <span key={key} className="ct-tag-channel">
          {full}
        </span>,
      )
    } else if (bold) {
      parts.push(
        <strong key={key} className="font-bold text-white">
          {bold.slice(2, -2)}
        </strong>,
      )
    } else if (italic) {
      parts.push(
        <em key={key} className="italic text-txt">
          {italic.slice(1, -1)}
        </em>,
      )
    } else if (code) {
      parts.push(
        <code
          key={key}
          className="rounded bg-black/40 px-1 py-0.5 font-mono text-xs text-[#eb5757]"
        >
          {code.slice(1, -1)}
        </code>,
      )
    }

    lastIndex = regex.lastIndex
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts
}

export function Avatar({
  member,
  size = 40,
}: {
  member?: CastMember
  size?: number
}) {
  const color = member?.color ?? "#4e5058"
  if (member?.avatarUrl) {
    return (
      <img
        src={member.avatarUrl}
        alt={member.name}
        className="shrink-0 rounded-full object-cover ring-2 ring-white/10"
        style={{ width: size, height: size }}
      />
    )
  }
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-semibold text-white select-none"
      style={{
        width: size,
        height: size,
        background: color,
        fontSize: size * 0.4,
      }}
    >
      {initials(member?.name ?? "?")}
    </div>
  )
}

function Badge({ label }: { label: string }) {
  return (
    <span className="rounded bg-blurple px-1 py-px text-[10px] font-semibold tracking-wide text-white uppercase">
      {label}
    </span>
  )
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 pt-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="ct-dot h-2 w-2 rounded-full bg-txt-muted"
          style={{ animationDelay: `${i * 0.16}s` }}
        />
      ))}
    </span>
  )
}

/**
 * The single render surface used by BOTH the live preview and (would be) the
 * export renderer — driven purely by the current time `t`. Only the last
 * `visibleWindow` revealed events stay on screen; older ones scroll off top.
 */
export default function ChatStage({
  cast,
  timed,
  t,
  settings,
}: {
  cast: CastMember[]
  timed: TimedEvent[]
  t: number
  settings: Settings
}) {
  const solo = settings.mode === "solo"
  const center = settings.align === "center"
  const revealed = timed.filter((e) => e.revealAt <= t && e.type !== "reaction")

  const typingEv = timed.find(
    (e) => e.type === "message" && t >= e.typingStart && t < e.typingEnd,
  )
  const typer = typingEv ? findMember(cast, typingEv.userId) : undefined

  // solo mode: one beat at a time (the typer alone while typing, else the
  // most recent message). stack mode: the last `visibleWindow` beats.
  const visible = solo
    ? typer
      ? []
      : revealed.slice(-1)
    : revealed.slice(-settings.visibleWindow)

  // reactions attach to whatever text message they follow in the list
  const reactionsFor = (idx: number) =>
    timed.filter(
      (e, i) => e.type === "reaction" && e.revealAt <= t && i === idx + 1,
    )

  return (
    <div
      className={`flex h-full flex-col justify-center overflow-hidden px-4 ${
        solo ? "py-4" : "py-3"
      }`}
      style={{ background: settings.background }}
    >
      <div className={`flex flex-col gap-4 ${center ? "items-center" : ""}`}>
        {visible.map((ev) => {
          const m = findMember(cast, ev.userId)
          const globalIdx = timed.indexOf(ev)
          const reacts = reactionsFor(globalIdx)

          if (ev.type === "join" || ev.type === "leave") {
            return (
              <div
                key={ev.id}
                className={`ct-pop flex items-center gap-2 text-sm italic text-txt-faint ${
                  center ? "justify-center" : "pl-1"
                }`}
              >
                {ev.type === "join" ? (
                  <IconEnter size={16} className="text-online not-italic" />
                ) : (
                  <IconExit size={16} className="text-[#ed4245] not-italic" />
                )}
                <span style={{ color: m?.color }} className="font-medium">
                  {m?.name ?? "Someone"}
                </span>
                {ev.type === "join"
                  ? "joined the channel."
                  : "left the channel."}
              </div>
            )
          }

          const isEveryone = /@(everyone|here)\b/i.test(ev.text)
          const isTag = !isEveryone && /@[\w.-]+|@\[[^\]]+\]/.test(ev.text)
          const mentionRowClass = isEveryone
            ? "ct-mention-everyone"
            : isTag
              ? "ct-mention-tag"
              : "border-l-2 border-transparent"

          return (
            <div
              key={ev.id}
              className={`ct-pop -mx-2 flex gap-3 rounded-r-md px-2 py-1 transition-colors ${
                center ? "max-w-[85%]" : ""
              } ${mentionRowClass}`}
            >
              <Avatar member={m} />
              <div className={center ? "min-w-0" : "min-w-0 flex-1"}>
                <div className="flex items-baseline gap-2">
                  <span
                    className="font-medium leading-none"
                    style={{ color: m?.color ?? "#fff" }}
                  >
                    {m?.name ?? "Unknown"}
                  </span>
                  {m?.badge ? <Badge label={m.badge} /> : null}
                  <span className="text-xs text-txt-faint">
                    {ev.timestamp ||
                      autoTimestamp(
                        settings.startTime ?? "09:03",
                        ev.revealAt,
                      )}
                  </span>
                </div>
                <div className="mt-0.5 text-[15px] leading-snug break-words text-txt">
                  {formatMessageText(ev.text, cast)}
                </div>
                {reacts.length ? (
                  <div className="mt-1.5 flex gap-1.5">
                    {reacts.map((r) => (
                      <span
                        key={r.id}
                        className="ct-pop inline-flex items-center gap-1 rounded-md bg-black/25 px-1.5 py-0.5 text-sm ring-1 ring-blurple/40"
                      >
                        {r.emoji ? (
                          r.emoji
                        ) : (
                          <IconSmile size={14} className="text-txt-muted" />
                        )}{" "}
                        <span className="text-xs font-semibold text-txt-muted">
                          1
                        </span>
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          )
        })}

        {typer ? (
          <div
            className={`flex items-center gap-3 opacity-90 ${
              center ? "max-w-[85%]" : ""
            }`}
          >
            <Avatar member={typer} size={40} />
            <div className="flex flex-col">
              <span
                className="text-sm font-medium"
                style={{ color: typer.color }}
              >
                {typer.name}
              </span>
              <TypingDots />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
