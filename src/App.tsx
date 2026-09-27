import { useEffect, useMemo, useRef, useState } from "react"
import type { ComponentType, ReactNode } from "react"
import ChatStage, { Avatar } from "./chattale/ChatStage"
import Landing from "./chattale/Landing"
import Footer from "./chattale/Footer"
import { Btn, Card, Field, SectionHead } from "./chattale/ui"
import Dropdown from "./chattale/Dropdown"
import ColorField from "./chattale/ColorField"
import { playMessagePing } from "./chattale/sound"
import { clearProject, loadProject, saveProject } from "./chattale/storage"
import { toCanvas } from "html-to-image"
import {
  DISCORD_COLORS,
  buildTimeline,
  defaultSettings,
  eventDuration,
  fmtTime,
  findMember,
  parseScript,
  uid,
} from "./chattale/lib"
import type {
  CastMember,
  EventType,
  Settings,
  StoryEvent,
} from "./chattale/types"
import {
  IconArrowRight,
  IconChat,
  IconChevronDown,
  IconChevronUp,
  IconClock,
  IconClose,
  IconDownload,
  IconEnter,
  IconExit,
  IconImage,
  IconMessage,
  IconPause,
  IconPlay,
  IconPlus,
  IconRestart,
  IconSmile,
  IconSpark,
  IconTrash,
  IconVolume,
} from "./chattale/icons"

type Step = "home" | "cast" | "story" | "preview"

const STEPS: Step[] = ["cast", "story", "preview"]

const SCRIPT_TEMPLATE = `# ChatTale script format
# One beat per line. Blank lines and #comments are ignored.
#
#   Message   Name: what they say
#   Join      [Name joins]
#   Leave     [Name leaves]
#
# Any name that isn't already in your cast is added automatically,
# so you can paste dialogue without setting anything up first.
#
# Example shape:
#
#   <name>: <message>
#   [<name> joins]
#   [<name> leaves]
`

// Typing-speed presets — higher factor = shorter typing phase.
const SPEED_PRESETS: [string, number][] = [
  ["Slow", 0.5],
  ["Normal", 1],
  ["Fast", 1.75],
  ["Turbo", 3],
]

const EVENT_META: Record<EventType, {
  label: string
  color: string
  Icon: ComponentType<{ size?: number, className?: string }>
}> = {
  message: { label: "Message", color: "#5865f2", Icon: IconMessage },
  join: { label: "Join", color: "#23a55a", Icon: IconEnter },
  leave: { label: "Leave", color: "#ed4245", Icon: IconExit },
  reaction: { label: "Reaction", color: "#eb459e", Icon: IconSmile },
}

export default function App() {
  // Hydrate from the last autosaved project so a reload never loses work.
  // A new visitor starts with a completely empty project.
  const [boot] = useState(loadProject)
  const [step, setStep] = useState<Step>(() => {
    const saved = boot?.step as Step | undefined
    return saved && STEPS.includes(saved) ? saved : "home"
  })
  const [cast, setCast] = useState<CastMember[]>(() => boot?.cast ?? [])
  const [events, setEvents] = useState<StoryEvent[]>(() => boot?.events ?? [])
  const [settings, setSettings] = useState<Settings>(
    () => boot?.settings ?? defaultSettings,
  )

  useEffect(() => {
    saveProject({ cast, events, settings, step })
  }, [cast, events, settings, step])

  const startOver = () => {
    clearProject()
    setCast([])
    setEvents([])
    setSettings(defaultSettings)
    setStep("cast")
  }

  return (
    <div className="relative flex min-h-screen flex-col text-txt">
      <div className="ct-backdrop" />

      <header className="ct-glass ct-nav sticky top-0 z-30">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 sm:px-6">
          <button
            onClick={() => setStep("home")}
            className="flex items-center gap-2.5"
          >
            <img
              src="/favicon.svg"
              alt="ChatTale logo"
              className="h-9 w-9 drop-shadow-[0_4px_12px_rgba(88,101,242,0.3)]"
            />
            <span className="font-display text-lg font-bold tracking-tight text-white">
              ChatTale
            </span>
          </button>

          {step === "home" ? (
            <Btn onClick={() => setStep("cast")}>
              Open studio <IconArrowRight size={16} />
            </Btn>
          ) : (
            <div className="flex items-center gap-2">
              <Stepper step={step} setStep={setStep} />
              <button
                onClick={startOver}
                title="Delete this project and start from scratch"
                className="hidden rounded-lg p-2 text-txt-faint transition hover:bg-white/5 hover:text-pink sm:block"
                aria-label="Start over"
              >
                <IconRestart size={16} />
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="relative z-10 flex-1">
        {step === "home" && <Landing onStart={() => setStep("cast")} />}

        {step !== "home" && (
          <div className="mx-auto max-w-6xl px-5 py-8 pb-16 sm:px-6">
            {step === "cast" && (
              <CastBuilder
                cast={cast}
                events={events}
                setCast={setCast}
                onNext={() => setStep("story")}
                onStartOver={startOver}
              />
            )}
            {step === "story" && (
              <StoryEditor
                cast={cast}
                setCast={setCast}
                events={events}
                setEvents={setEvents}
                settings={settings}
                setSettings={setSettings}
                onPreview={() => setStep("preview")}
              />
            )}
            {step === "preview" && (
              <Preview
                cast={cast}
                events={events}
                settings={settings}
                setSettings={setSettings}
              />
            )}
          </div>
        )}
      </main>

      <Footer onHome={() => setStep("home")} />
    </div>
  )
}

/* ---------------------------------- Stepper --------------------------------- */

function Stepper({ step, setStep }: { step: Step, setStep: (s: Step) => void }) {
  const items: { key: Step, label: string, n: number }[] = [
    { key: "cast", label: "Cast", n: 1 },
    { key: "story", label: "Storyboard", n: 2 },
    { key: "preview", label: "Preview", n: 3 },
  ]
  return (
    <nav className="flex items-center gap-1 rounded-2xl border border-white/5 bg-black/20 p-1">
      {items.map((it) => {
        const active = step === it.key
        return (
          <button
            key={it.key}
            onClick={() => setStep(it.key)}
            className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-medium transition-all ${
              active
                ? "bg-blurple text-white shadow-[0_6px_18px_-8px_rgba(88,101,242,0.9)]"
                : "text-txt-muted hover:bg-white/5 hover:text-txt"
            }`}
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                active ? "bg-white/25" : "bg-white/10"
              }`}
            >
              {it.n}
            </span>
            <span className="hidden sm:inline">{it.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

/* -------------------------------- Cast Builder ------------------------------ */

function CastBuilder({
  cast,
  events,
  setCast,
  onNext,
  onStartOver,
}: {
  cast: CastMember[]
  events: StoryEvent[]
  setCast: (c: CastMember[]) => void
  onNext: () => void
  onStartOver: () => void
}) {
  const add = () =>
    setCast([
      ...cast,
      {
        id: uid(),
        name: "New User",
        handle: "user" + (cast.length + 1),
        color: DISCORD_COLORS[cast.length % DISCORD_COLORS.length],
        avatarUrl: "",
        badge: "",
      },
    ])
  const patch = (id: string, p: Partial<CastMember>) =>
    setCast(cast.map((c) => (c.id === id ? { ...c, ...p } : c)))
  const remove = (id: string) => setCast(cast.filter((c) => c.id !== id))

  return (
    <section className="ct-rise">
      <SectionHead
        eyebrow="Step 1"
        title="Build your cast"
        sub="Upload avatars, set role colors, and add badges. These are the characters in your story."
        action={
          <div className="flex items-center gap-2">
            <Btn
              variant="ghost"
              onClick={onStartOver}
              disabled={!cast.length && !events.length}
            >
              <IconRestart size={15} /> Start over
            </Btn>
            <Btn onClick={onNext}>
              Next: Storyboard <IconArrowRight size={16} />
            </Btn>
          </div>
        }
      />

      {!cast.length && (
        <Card className="mb-4 flex flex-col items-center gap-2 border-dashed p-8 text-center">
          <p className="font-display text-lg font-semibold text-white">
            No characters yet
          </p>
          <p className="max-w-md text-sm text-txt-muted">
            This step is optional — skip straight to the storyboard and use
            Quick add, which creates characters from the names in your script.
            You can also add one now and rename it later.
          </p>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cast.map((m) => (
          <Card key={m.id} className="p-5">
            <div className="flex items-center gap-3">
              <AvatarUpload
                member={m}
                onChange={(url) => patch(m.id, { avatarUrl: url })}
              />
              <div className="min-w-0 flex-1">
                <div
                  className="truncate font-medium"
                  style={{ color: m.color }}
                >
                  {m.name || "Unnamed"}
                </div>
                <div className="truncate text-xs text-txt-faint">
                  @{m.handle}
                </div>
              </div>
              <button
                onClick={() => remove(m.id)}
                className="text-txt-faint transition hover:text-pink"
                aria-label="Delete character"
              >
                <IconTrash size={16} />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <Field label="Display name">
                <input
                  className="ct-input"
                  value={m.name}
                  onChange={(e) => patch(m.id, { name: e.target.value })}
                />
              </Field>
              <Field label="Handle">
                <input
                  className="ct-input"
                  value={m.handle}
                  onChange={(e) => patch(m.id, { handle: e.target.value })}
                />
              </Field>
              <Field label="Role color">
                <div className="flex flex-wrap gap-1.5">
                  {DISCORD_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => patch(m.id, { color: c })}
                      className={`h-6 w-6 rounded-full ring-2 transition ${
                        m.color === c ? "ring-white" : "ring-transparent"
                      }`}
                      style={{ background: c }}
                      aria-label={c}
                    />
                  ))}
                </div>
              </Field>
              <Field label="Badge">
                <div className="flex gap-1.5">
                  {(["", "BOT", "ADMIN", "MOD", "OP"] as const).map((b) => (
                    <button
                      key={b || "none"}
                      onClick={() => patch(m.id, { badge: b })}
                      className={`rounded-lg px-2 py-1 text-xs font-semibold transition ${
                        m.badge === b
                          ? "bg-blurple text-white"
                          : "bg-white/5 text-txt-muted hover:text-txt"
                      }`}
                    >
                      {b || "None"}
                    </button>
                  ))}
                </div>
              </Field>
            </div>
          </Card>
        ))}

        <button
          onClick={add}
          className="flex min-h-[240px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-hair-2 text-txt-muted transition hover:border-blurple hover:bg-blurple/5 hover:text-txt"
        >
          <IconPlus size={28} />
          <span className="text-sm font-medium">Add character</span>
        </button>
      </div>
    </section>
  )
}

function AvatarUpload({
  member,
  onChange,
}: {
  member: CastMember
  onChange: (url: string) => void
}) {
  const input = useRef<HTMLInputElement>(null)
  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => onChange(String(reader.result))
    reader.readAsDataURL(file)
    e.target.value = ""
  }
  return (
    <div className="relative">
      <button
        onClick={() => input.current?.click()}
        className="group relative block h-14 w-14 overflow-hidden rounded-full ring-2 ring-white/10 transition hover:ring-blurple"
        aria-label="Upload avatar"
      >
        <Avatar member={member} size={56} />
        <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-white opacity-0 transition group-hover:opacity-100">
          <IconImage size={18} />
        </span>
      </button>
      {member.avatarUrl && (
        <button
          onClick={() => onChange("")}
          className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-panel-2 text-txt-muted ring-1 ring-white/10 transition hover:text-pink"
          aria-label="Remove avatar"
        >
          <IconClose size={12} />
        </button>
      )}
      <input
        ref={input}
        type="file"
        accept="image/*"
        onChange={handle}
        className="hidden"
      />
    </div>
  )
}

/* ------------------------------- Story Editor ------------------------------- */

function StoryEditor({
  cast,
  setCast,
  events,
  setEvents,
  settings,
  setSettings,
  onPreview,
}: {
  cast: CastMember[]
  setCast: (c: CastMember[]) => void
  events: StoryEvent[]
  setEvents: (e: StoryEvent[]) => void
  settings: Settings
  setSettings: (s: Settings) => void
  onPreview: () => void
}) {
  const [quick, setQuick] = useState(false)
  const [script, setScript] = useState("")

  const [focusId, setFocusId] = useState<string | null>(null)

  // Insert a beat at `index` (defaults to end) and queue it for autofocus.
  // A beat needs a speaker, so an empty cast gets one created on the spot —
  // that keeps the storyboard usable straight from a blank project.
  const addEvent = (type: EventType, index = events.length) => {
    let userId = cast[0]?.id
    if (!userId) {
      userId = uid()
      setCast([
        ...cast,
        {
          id: userId,
          name: "New User",
          handle: "user" + (cast.length + 1),
          color: DISCORD_COLORS[cast.length % DISCORD_COLORS.length],
          avatarUrl: "",
          badge: "",
        },
      ])
    }
    const beat: StoryEvent = {
      id: uid(),
      type,
      userId,
      text: "",
      emoji: "",
      timing: "auto",
      timestamp: "",
    }
    const next = [...events]
    next.splice(index, 0, beat)
    setEvents(next)
    setFocusId(beat.id)
  }
  const patch = (id: string, p: Partial<StoryEvent>) =>
    setEvents(events.map((e) => (e.id === id ? { ...e, ...p } : e)))
  const remove = (id: string) => setEvents(events.filter((e) => e.id !== id))
  const move = (idx: number, dir: -1 | 1) => {
    const j = idx + dir
    if (j < 0 || j >= events.length) return
    const next = [...events]
    ;[next[idx], next[j]] = [next[j], next[idx]]
    setEvents(next)
  }

  const fileRef = useRef<HTMLInputElement>(null)

  const runImport = () => {
    const { events: parsed, cast: nextCast } = parseScript(script, cast)
    if (!parsed.length) return
    setCast(nextCast)
    setEvents([...events, ...parsed])
    setScript("")
    setQuick(false)
  }

  const downloadTemplate = () => {
    const blob = new Blob([SCRIPT_TEMPLATE], {
      type: "text/plain;charset=utf-8",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "chattale-template.txt"
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadProject = () => {
    const data = JSON.stringify({ cast, events, settings }, null, 2)
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${settings.channel || "chattale"}-project.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const uploadScript = (file?: File) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setScript(String(reader.result ?? ""))
      setQuick(true)
    }
    reader.readAsText(file)
  }

  const totalDur = events.reduce(
    (a, e) =>
      a + eventDuration(e, settings.typingSpeed, settings.intervalSpeed),
    0,
  )

  const addBtns: { type: EventType }[] = [
    { type: "message" },
    { type: "join" },
    { type: "leave" },
    { type: "reaction" },
  ]

  return (
    <section className="ct-rise">
      <SectionHead
        eyebrow="Step 2"
        title="Direct the scene"
        sub="Each beat sits on a timeline. Timing auto-scales to text length, so typing feels human."
        action={
          <Btn onClick={onPreview} disabled={!events.length}>
            <IconPlay size={15} /> Preview
          </Btn>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_290px]">
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {addBtns.map(({ type }) => {
              const meta = EVENT_META[type]
              return (
                <button
                  key={type}
                  onClick={() => addEvent(type)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm font-medium text-txt-muted transition hover:border-white/20 hover:text-txt"
                >
                  <span style={{ color: meta.color }}>
                    <meta.Icon size={15} />
                  </span>
                  {meta.label}
                </button>
              )
            })}
            <Btn
              variant="outline"
              onClick={() => setQuick((q) => !q)}
              className="ml-auto"
            >
              <IconSpark size={15} /> Quick add
            </Btn>
            <Btn
              variant="outline"
              onClick={downloadProject}
              title="Download project"
            >
              <IconDownload size={15} /> Backup
            </Btn>
          </div>

          {!cast.length && (
            <Card className="mb-4 border-dashed p-4 text-sm text-txt-muted">
              No cast yet, so there&apos;s nobody to write for.{" "}
              <button
                onClick={() => setQuick(true)}
                className="font-medium text-blurple-hi underline underline-offset-2 hover:text-txt"
              >
                Use Quick add
              </button>{" "}
              to paste dialogue and create your characters automatically, or
              just add a beat below and we&apos;ll create a speaker for you.
            </Card>
          )}

          {quick && (
            <Card className="mb-4 p-4">
              <p className="mb-2 text-xs text-txt-muted">
                One line each. Format:{" "}
                <code className="rounded bg-black/40 px-1">Name: message</code>{" "}
                or{" "}
                <code className="rounded bg-black/40 px-1">[Name joins]</code>.
                New names become cast members.
              </p>
              <textarea
                className="ct-input h-32 font-mono text-sm"
                placeholder={
                  "<name>: <message>\n[<name> joins]\n[<name> leaves]"
                }
                value={script}
                onChange={(e) => setScript(e.target.value)}
              />
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <button
                  onClick={downloadTemplate}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-xs font-medium text-txt-muted transition hover:border-white/20 hover:text-txt"
                >
                  <IconDownload size={14} /> Template
                </button>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-xs font-medium text-txt-muted transition hover:border-white/20 hover:text-txt"
                >
                  <IconDownload size={14} className="rotate-180" /> Upload
                  script
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".txt,.md,text/plain"
                  className="hidden"
                  onChange={(e) => {
                    uploadScript(e.target.files?.[0])
                    e.target.value = ""
                  }}
                />
                <Btn onClick={runImport} className="ml-auto">
                  Import lines
                </Btn>
              </div>
            </Card>
          )}

          <div className="relative">
            {/* timeline rail */}
            {events.length > 0 && (
              <div className="absolute bottom-4 left-[15px] top-4 w-px bg-gradient-to-b from-white/5 via-white/10 to-white/5" />
            )}
            {events.length > 0 && (
              <div>
                <InsertZone onAdd={(type) => addEvent(type, 0)} />
                {events.map((ev, idx) => (
                  <div key={ev.id}>
                    <EventRow
                      ev={ev}
                      index={idx}
                      cast={cast}
                      first={idx === 0}
                      last={idx === events.length - 1}
                      speed={settings.typingSpeed}
                      autoFocus={ev.id === focusId}
                      onMove={(d) => move(idx, d)}
                      onPatch={(p) => patch(ev.id, p)}
                      onRemove={() => remove(ev.id)}
                      onAddAfter={() => addEvent("message", idx + 1)}
                    />
                    <InsertZone onAdd={(type) => addEvent(type, idx + 1)} />
                  </div>
                ))}
              </div>
            )}
            {!events.length && (
              <div className="rounded-2xl border border-dashed border-hair-2 py-12 text-center text-sm text-txt-faint">
                No beats yet. Add a message or use Quick add.
              </div>
            )}
          </div>
        </div>

        <aside className="h-fit lg:sticky lg:top-24">
          <Card className="space-y-4 p-5">
            <h3 className="font-display text-sm font-semibold text-white">
              Scene settings
            </h3>
            <Field label="Message flow">
              <div className="flex gap-1 rounded-xl bg-black/30 p-1">
                {([
                  ["stack", "Stack"],
                  ["solo", "One at a time"],
                ] as const).map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setSettings({ ...settings, mode: val })}
                    className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition ${
                      settings.mode === val
                        ? "bg-blurple text-white shadow-[0_6px_16px_-8px_rgba(88,101,242,0.9)]"
                        : "text-txt-muted hover:text-txt"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Alignment">
              <div className="flex gap-1 rounded-xl bg-black/30 p-1">
                {([
                  ["left", "Left"],
                  ["center", "Center"],
                ] as const).map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setSettings({ ...settings, align: val })}
                    className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition ${
                      settings.align === val
                        ? "bg-blurple text-white shadow-[0_6px_16px_-8px_rgba(88,101,242,0.9)]"
                        : "text-txt-muted hover:text-txt"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Typing speed">
              <div className="flex gap-1 rounded-xl bg-black/30 p-1">
                {SPEED_PRESETS.map(([label, val]) => (
                  <button
                    key={label}
                    onClick={() =>
                      setSettings({ ...settings, typingSpeed: val })
                    }
                    className={`flex-1 rounded-lg px-1.5 py-1.5 text-xs font-medium transition ${
                      settings.typingSpeed === val
                        ? "bg-blurple text-white shadow-[0_6px_16px_-8px_rgba(88,101,242,0.9)]"
                        : "text-txt-muted hover:text-txt"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </Field>
            {settings.mode === "stack" && (
              <Field label={`Visible messages: ${settings.visibleWindow}`}>
                <input
                  type="range"
                  min={2}
                  max={5}
                  value={settings.visibleWindow}
                  onChange={(e) =>
                    setSettings({ ...settings, visibleWindow: +e.target.value })
                  }
                  className="w-full accent-blurple"
                />
              </Field>
            )}
            <Field label="Channel name">
              <input
                className="ct-input"
                value={settings.channel}
                onChange={(e) =>
                  setSettings({ ...settings, channel: e.target.value })
                }
              />
            </Field>
            <Field label="Aspect ratio">
              <Dropdown
                value={settings.aspect}
                onChange={(v) =>
                  setSettings({ ...settings, aspect: v as Settings["aspect"] })
                }
                options={[
                  { value: "9:16", label: "9:16 · Shorts / Reels / TikTok" },
                  { value: "1:1", label: "1:1 · Square" },
                  { value: "16:9", label: "16:9 · YouTube" },
                ]}
              />
            </Field>
            <Field label="Background">
              <ColorField
                value={settings.background}
                onChange={(v) => setSettings({ ...settings, background: v })}
              />
            </Field>
            <div className="flex items-center justify-between border-t border-white/5 pt-3 text-xs text-txt-faint">
              <span>{events.length} beats</span>
              <span className="inline-flex items-center gap-1">
                <IconClock size={13} /> {fmtTime(totalDur)} runtime
              </span>
            </div>
          </Card>
        </aside>
      </div>
    </section>
  )
}

// Hover-reveal affordance between beats: a "+" that opens an inline type picker
// so you can drop a beat exactly where you want it without scrolling.
function InsertZone({ onAdd }: { onAdd: (type: EventType) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onDoc)
    return () => document.removeEventListener("mousedown", onDoc)
  }, [open])

  const types: EventType[] = ["message", "join", "leave", "reaction"]

  return (
    <div
      ref={ref}
      className="group/insert relative flex h-5 items-center justify-center pl-8"
    >
      <div
        className={`pointer-events-none absolute inset-x-8 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-blurple/50 to-transparent transition-opacity ${
          open ? "opacity-100" : "opacity-0 group-hover/insert:opacity-100"
        }`}
      />
      {open ? (
        <div className="ct-glass relative z-20 flex items-center gap-1 rounded-xl border border-white/10 p-1 shadow-2xl">
          {types.map((type) => {
            const meta = EVENT_META[type]
            return (
              <button
                key={type}
                onClick={() => {
                  onAdd(type)
                  setOpen(false)
                }}
                className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-txt-muted transition hover:bg-white/10 hover:text-txt"
              >
                <span style={{ color: meta.color }}>
                  <meta.Icon size={13} />
                </span>
                {meta.label}
              </button>
            )
          })}
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          aria-label="Insert beat here"
          className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full border border-white/15 bg-panel-2 text-txt-faint opacity-0 shadow-lg transition hover:border-blurple hover:text-white group-hover/insert:opacity-100"
        >
          <IconPlus size={14} />
        </button>
      )}
    </div>
  )
}

function EventRow({
  ev,
  index,
  cast,
  first,
  last,
  speed,
  autoFocus,
  onMove,
  onPatch,
  onRemove,
  onAddAfter,
}: {
  ev: StoryEvent
  index: number
  cast: CastMember[]
  first: boolean
  last: boolean
  speed: number
  autoFocus: boolean
  onMove: (d: -1 | 1) => void
  onPatch: (p: Partial<StoryEvent>) => void
  onRemove: () => void
  onAddAfter: () => void
}) {
  const m = findMember(cast, ev.userId)
  const meta = EVENT_META[ev.type]
  const secs = (eventDuration(ev, speed) / 1000).toFixed(1)
  const textRef = useRef<HTMLInputElement>(null)

  // Autofocus a freshly-added beat so you can type immediately (no scroll-hunt).
  useEffect(() => {
    if (autoFocus) textRef.current?.focus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFocus])

  return (
    <div className="group relative flex gap-3 pl-8">
      {/* timeline node */}
      <div
        className="absolute left-2 top-4 z-10 flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-[#0a0a0f]"
        style={{ background: meta.color }}
      >
        <span className="text-[9px] font-bold text-black/70">{index + 1}</span>
      </div>

      <div className="ct-card-hl flex-1 overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] transition hover:border-white/10">
        {/* header */}
        <div className="flex flex-wrap items-center gap-2 border-b border-white/5 bg-white/[0.02] px-3 py-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold"
            style={{ background: `${meta.color}22`, color: meta.color }}
          >
            <meta.Icon size={13} /> {meta.label}
          </span>

          <Dropdown
            className="w-40"
            value={ev.userId}
            onChange={(v) => onPatch({ userId: v })}
            options={cast.map((c) => ({
              value: c.id,
              label: c.name,
              leading: <Avatar member={c} size={18} />,
            }))}
          />

          <span className="inline-flex items-center gap-1 rounded-md bg-black/30 px-1.5 py-1 text-[11px] tabular-nums text-txt-faint">
            <IconClock size={11} /> {secs}s
          </span>

          <div className="ml-auto flex items-center gap-0.5">
            <button
              onClick={() => onMove(-1)}
              disabled={first}
              className="rounded-md p-1 text-txt-faint transition hover:bg-white/10 hover:text-txt disabled:opacity-20"
              aria-label="Move up"
            >
              <IconChevronUp size={15} />
            </button>
            <button
              onClick={() => onMove(1)}
              disabled={last}
              className="rounded-md p-1 text-txt-faint transition hover:bg-white/10 hover:text-txt disabled:opacity-20"
              aria-label="Move down"
            >
              <IconChevronDown size={15} />
            </button>
            <button
              onClick={onRemove}
              className="rounded-md p-1 text-txt-faint opacity-0 transition hover:bg-white/10 hover:text-pink group-hover:opacity-100"
              aria-label="Delete beat"
            >
              <IconClose size={15} />
            </button>
          </div>
        </div>

        {/* body */}
        <div className="p-3">
          {ev.type === "message" && (
            <div className="space-y-2">
              <input
                ref={textRef}
                className="ct-input text-[15px]"
                value={ev.text}
                placeholder="What do they say?  (Enter for next line)"
                onChange={(e) => onPatch({ text: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    onAddAfter()
                  }
                }}
              />
              <input
                className="ct-input w-32 py-1 text-xs"
                placeholder="9:03 AM"
                value={ev.timestamp}
                onChange={(e) => onPatch({ timestamp: e.target.value })}
              />
            </div>
          )}
          {ev.type === "reaction" && (
            <div className="flex items-center gap-2">
              <input
                className="ct-input w-24 text-center text-lg"
                value={ev.emoji}
                placeholder=":)"
                onChange={(e) => onPatch({ emoji: e.target.value })}
              />
              <span className="text-xs text-txt-faint">
                reacts to the message above
              </span>
            </div>
          )}
          {(ev.type === "join" || ev.type === "leave") && (
            <div className="flex items-center gap-2 text-sm italic text-txt-faint">
              <span style={{ color: meta.color }}>
                <meta.Icon size={15} />
              </span>
              {m?.name ?? "User"} {ev.type === "join" ? "joined" : "left"} the
              channel.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Compact labeled segmented control used across the settings panels.
function Segmented({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: [string, string][]
}) {
  return (
    <div className="min-w-0">
      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.08em] text-txt-faint">
        {label}
      </span>
      <div className="flex gap-0.5 rounded-lg bg-black/30 p-0.5">
        {options.map(([val, text]) => (
          <button
            key={val}
            onClick={() => onChange(val)}
            className={`min-w-0 flex-1 truncate rounded-md px-1.5 py-1 text-[11px] font-medium transition ${
              value === val
                ? "bg-blurple text-white shadow-[0_6px_16px_-8px_rgba(88,101,242,0.9)]"
                : "text-txt-muted hover:text-txt"
            }`}
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ---------------------------------- Preview --------------------------------- */

const ASPECT: Record<Settings["aspect"], string> = {
  "9:16": "9 / 16",
  "1:1": "1 / 1",
  "16:9": "16 / 9",
}

function Preview({
  cast,
  events,
  settings,
  setSettings,
}: {
  cast: CastMember[]
  events: StoryEvent[]
  settings: Settings
  setSettings: (s: Settings) => void
}) {
  const aspect = settings.aspect
  const portrait = aspect === "9:16"
  const wide = aspect === "16:9"
  const frameClass = portrait
    ? "h-[68vh] max-h-[640px]"
    : wide
      ? "w-full max-w-[880px]"
      : "w-full max-w-[560px]"
  const { timed, total } = useMemo(
    () => buildTimeline(events, settings.typingSpeed, settings.intervalSpeed),
    [events, settings.typingSpeed, settings.intervalSpeed],
  )
  const [t, setT] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [sound, setSound] = useState(true)
  const raf = useRef<number>(0)
  const last = useRef<number>(0)
  const soundRef = useRef(sound)
  soundRef.current = sound
  const frameRef = useRef<HTMLDivElement>(null)
  const [exporting, setExporting] = useState(false)
  const [exportPct, setExportPct] = useState(0)

  useEffect(() => {
    if (!playing) return
    last.current = performance.now()
    const tick = (now: number) => {
      const dt = now - last.current
      last.current = now
      setT((prev) => {
        const next = prev + dt
        // ping when a message is revealed as the playhead crosses it
        if (soundRef.current) {
          for (const e of timed) {
            if (
              e.type === "message" &&
              e.revealAt > prev &&
              e.revealAt <= next
            ) {
              playMessagePing()
              break
            }
          }
        }
        if (next >= total) {
          setPlaying(false)
          return total
        }
        return next
      })
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [playing, total, timed])

  const toggle = () => {
    if (!playing && t >= total) setT(0)
    setPlaying((p) => !p)
  }
  const restart = () => {
    setT(0)
    setPlaying(true)
  }
  const scrub = (delta: number) => {
    setPlaying(false)
    setT((prev) => Math.min(total, Math.max(0, prev + delta)))
  }

  // Transport shortcuts: space/K play-pause, R restart, arrows scrub, M mute.
  // Ignored while typing so the story editor's inputs keep normal behavior.
  useEffect(() => {
    const typing = () => {
      const el = document.activeElement
      if (!el) return false
      const tag = el.tagName
      return (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        (el as HTMLElement).isContentEditable
      )
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || typing()) return
      if (exporting) return
      switch (e.key) {
        case " ":
        case "k":
        case "K":
          e.preventDefault()
          toggle()
          break
        case "r":
        case "R":
          e.preventDefault()
          restart()
          break
        case "ArrowLeft":
          e.preventDefault()
          scrub(-500)
          break
        case "ArrowRight":
          e.preventDefault()
          scrub(500)
          break
        case "m":
        case "M":
          e.preventDefault()
          setSound((s) => !s)
          break
        default:
          break
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  // Client-side render: play the timeline in real time while rasterizing the
  // frame to an offscreen canvas whose captureStream feeds a MediaRecorder.
  // Produces a WebM (browsers can't natively encode MP4 without ffmpeg).
  const exportVideo = async () => {
    const node = frameRef.current
    if (!node || exporting) return
    if (typeof MediaRecorder === "undefined") {
      alert("This browser can't record video. Try the latest Chrome or Edge.")
      return
    }

    setPlaying(false)
    setExporting(true)
    setExportPct(0)

    const rect = node.getBoundingClientRect()
    const scale = 2
    const cw = Math.round(rect.width * scale)
    const ch = Math.round(rect.height * scale)
    const canvas = document.createElement("canvas")
    canvas.width = cw
    canvas.height = ch
    const ctx = canvas.getContext("2d")!

    const mime =
      ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"].find(
        (m) => MediaRecorder.isTypeSupported(m),
      ) ?? "video/webm"
    const stream = canvas.captureStream(30)
    const rec = new MediaRecorder(stream, {
      mimeType: mime,
      videoBitsPerSecond: 8_000_000,
    })
    const chunks: BlobPart[] = []
    rec.ondataavailable = (e) => e.data.size && chunks.push(e.data)

    const finish = () =>
      new Promise<void>((resolve) => {
        rec.onstop = () => {
          const blob = new Blob(chunks, { type: "video/webm" })
          const url = URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = `${settings.channel || "chattale"}.webm`
          a.click()
          URL.revokeObjectURL(url)
          resolve()
        }
        rec.stop()
      })

    rec.start()
    const start = performance.now()
    const nextFrame = () =>
      new Promise<void>((r) => requestAnimationFrame(() => r()))

    // Drive real time -> t so the recorded duration matches the timeline.
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const elapsed = performance.now() - start
      const tt = Math.min(elapsed, total)
      setT(tt)
      setExportPct(Math.round((tt / total) * 100))
      // let React commit, then rasterize the current DOM state
      await nextFrame()
      await nextFrame()
      try {
        const snap = await toCanvas(node, {
          pixelRatio: scale,
          cacheBust: true,
        })
        ctx.drawImage(snap, 0, 0, cw, ch)
      } catch {
        // skip a dropped frame rather than aborting the whole render
      }
      if (tt >= total) break
    }

    await finish()
    setExporting(false)
    setExportPct(0)
    setT(0)
  }

  return (
    <section className="ct-rise">
      <SectionHead
        eyebrow="Step 3"
        title="Preview & export"
        sub="This is the exact chat surface your export renders — driven by one timeline clock."
        action={
          <Btn onClick={exportVideo} disabled={exporting || !events.length}>
            <IconDownload size={16} />
            {exporting ? `Rendering… ${exportPct}%` : "Export video"}
          </Btn>
        }
      />

      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-center gap-8 lg:flex-row lg:items-start lg:gap-12">
        <div className="relative flex w-full justify-center lg:flex-1 lg:justify-end">
          <div className="absolute -inset-8 -z-10 rounded-[3rem] bg-blurple/15 blur-3xl" />
          <div
            ref={frameRef}
            className={`relative overflow-hidden rounded-2xl border border-white/10 bg-ink shadow-2xl ${frameClass}`}
            style={{ aspectRatio: ASPECT[aspect] }}
          >
            <div className="flex h-full">
              {/* chat surface — the exact aspect the export renders */}
              <div className="relative min-w-0 flex-1">
                <div className="flex items-center gap-2 border-b border-black/40 bg-panel-2 px-4 py-2.5">
                  <span className="text-txt-faint">#</span>
                  <span className="text-sm font-semibold text-white">
                    {settings.channel}
                  </span>
                  <span className="ml-auto h-2 w-2 rounded-full bg-online" />
                </div>
                <div className="absolute inset-x-0 bottom-0 top-[45px]">
                  <ChatStage
                    cast={cast}
                    timed={timed}
                    t={t}
                    settings={settings}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Settings and controls sidebar */}
        <div className="flex w-full shrink-0 flex-col gap-6 sm:max-w-[520px] lg:max-w-[360px]">
          {/* live scene settings */}
          <Card className="grid w-full gap-x-4 gap-y-3 p-4 sm:grid-cols-2 lg:grid-cols-1">
            <Segmented
              label="Aspect"
              value={settings.aspect}
              onChange={(v) =>
                setSettings({ ...settings, aspect: v as Settings["aspect"] })
              }
              options={[
                ["9:16", "9:16"],
                ["1:1", "1:1"],
                ["16:9", "16:9"],
              ]}
            />
            <Segmented
              label="Flow"
              value={settings.mode}
              onChange={(v) =>
                setSettings({ ...settings, mode: v as Settings["mode"] })
              }
              options={[
                ["stack", "Stack"],
                ["solo", "Solo"],
              ]}
            />
            <Segmented
              label="Alignment"
              value={settings.align}
              onChange={(v) =>
                setSettings({ ...settings, align: v as Settings["align"] })
              }
              options={[
                ["left", "Left"],
                ["center", "Center"],
              ]}
            />
            <Segmented
              label="Typing speed"
              value={String(settings.typingSpeed)}
              onChange={(v) => setSettings({ ...settings, typingSpeed: +v })}
              options={SPEED_PRESETS.map(([label, val]) => [
                String(val),
                label,
              ])}
            />
            <Segmented
              label="Message pace"
              value={String(settings.intervalSpeed || 1)}
              onChange={(v) => setSettings({ ...settings, intervalSpeed: +v })}
              options={SPEED_PRESETS.map(([label, val]) => [
                String(val),
                label,
              ])}
            />
          </Card>

          <Card className="w-full p-3">
            <div className="flex items-center gap-3">
              <button
                onClick={toggle}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blurple text-white shadow-[0_8px_20px_-8px_rgba(88,101,242,0.9)] transition hover:bg-blurple-hi active:scale-95"
              >
                {playing ? <IconPause size={18} /> : <IconPlay size={18} />}
              </button>
              <button
                onClick={restart}
                className="text-txt-muted transition hover:text-txt"
                aria-label="Restart"
              >
                <IconRestart size={18} />
              </button>
              <span className="w-10 text-xs tabular-nums text-txt-muted">
                {fmtTime(t)}
              </span>
              <input
                type="range"
                min={0}
                max={total}
                value={t}
                onChange={(e) => {
                  setPlaying(false)
                  setT(+e.target.value)
                }}
                className="h-1 flex-1 accent-blurple"
              />
              <span className="w-10 text-right text-xs tabular-nums text-txt-faint">
                {fmtTime(total)}
              </span>
              <button
                onClick={() => {
                  setSound((s) => !s)
                  if (!sound) playMessagePing()
                }}
                aria-pressed={sound}
                aria-label={
                  sound ? "Mute message sound" : "Unmute message sound"
                }
                title={sound ? "Message sound on" : "Message sound off"}
                className={`relative shrink-0 transition ${
                  sound
                    ? "text-blurple hover:text-blurple-hi"
                    : "text-txt-faint hover:text-txt"
                }`}
              >
                <IconVolume size={18} />
                {!sound && (
                  <span className="pointer-events-none absolute left-1/2 top-1/2 h-[1.5px] w-6 -translate-x-1/2 -translate-y-1/2 -rotate-45 rounded bg-current" />
                )}
              </button>
            </div>
            <p className="mt-2.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-txt-faint">
              <Kbd>Space</Kbd> play
              <Kbd>R</Kbd> restart
              <Kbd>←</Kbd>
              <Kbd>→</Kbd> scrub
              <Kbd>M</Kbd> mute
            </p>
          </Card>
        </div>
      </div>
    </section>
  )
}

function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="rounded border border-white/10 bg-black/30 px-1.5 py-0.5 font-sans text-[10px] text-txt-muted">
      {children}
    </kbd>
  )
}
