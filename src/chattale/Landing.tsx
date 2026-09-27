import { useState } from "react"
import { Btn, Card, Pill } from "./ui"
import {
  IconArrowRight,
  IconBolt,
  IconClapper,
  IconDownload,
  IconMask,
  IconPhone,
  IconPlay,
  IconShield,
} from "./icons"

/**
 * Decorative hero mockup. Deliberately not wired to ChatStage or the project
 * types — it illustrates the shape of the output with placeholder copy, so no
 * sample cast or story ships in the bundle.
 */
function HeroMock() {
  return (
    <div className="ct-float relative w-[280px] shrink-0 sm:w-[320px]">
      <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-blurple/25 blur-3xl" />
      <div className="overflow-hidden rounded-[2.2rem] border border-white/10 bg-ink shadow-2xl ring-1 ring-black/40">
        <div className="flex items-center gap-2 border-b border-black/40 bg-panel-2 px-4 py-3">
          <span className="text-txt-faint">#</span>
          <span className="text-sm font-semibold text-white">your-channel</span>
          <span className="ml-auto h-2 w-2 rounded-full bg-online" />
        </div>

        <div
          className="flex h-[440px] flex-col justify-center gap-4 px-4"
          style={{ background: "#313338" }}
        >
          <div className="ct-pop flex gap-3">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
              style={{ background: "#eb459e" }}
            >
              C1
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span
                  className="font-medium leading-none"
                  style={{ color: "#eb459e" }}
                >
                  Character 1
                </span>
                <span className="text-xs text-txt-faint">9:00 AM</span>
              </div>
              <div className="mt-0.5 text-[15px] leading-snug break-words text-txt">
                Your dialogue goes here
              </div>
            </div>
          </div>

          <div
            className="ct-pop flex gap-3"
            style={{ animationDelay: "160ms" }}
          >
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
              style={{ background: "#00c8ff" }}
            >
              C2
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span
                  className="font-medium leading-none"
                  style={{ color: "#00c8ff" }}
                >
                  Character 2
                </span>
                <span className="text-xs text-txt-faint">9:00 AM</span>
              </div>
              <div className="mt-0.5 text-[15px] leading-snug break-words text-txt">
                One message at a time, with typing dots
              </div>
              <div className="mt-1.5 flex gap-1.5">
                <span className="ct-pop inline-flex items-center gap-1 rounded-md bg-black/25 px-1.5 py-0.5 text-sm ring-1 ring-blurple/40">
                  <span className="text-xs font-semibold text-txt-muted">
                    1
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div
            className="flex items-center gap-3 opacity-90"
            style={{ animationDelay: "320ms" }}
          >
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
              style={{ background: "#57f287" }}
            >
              C3
            </span>
            <span className="inline-flex items-center gap-1 pt-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="ct-dot h-2 w-2 rounded-full bg-txt-muted"
                  style={{ animationDelay: `${i * 0.16}s` }}
                />
              ))}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

const STEPS = [
  {
    n: 1,
    title: "Build the cast",
    body: "Give every character a name, an avatar, a role color, and an optional badge. New names you type later join the cast automatically.",
    Icon: IconMask,
  },
  {
    n: 2,
    title: "Direct the scene",
    body: "Add message, join, leave, and reaction beats on a visual timeline. Reorder them, or paste a whole script in one go.",
    Icon: IconClapper,
  },
  {
    n: 3,
    title: "Preview & export",
    body: "Scrub the timeline, flip between vertical and square, then record the exact frame you're looking at straight to a video file.",
    Icon: IconDownload,
  },
]

const FEATURES = [
  {
    Icon: IconMask,
    title: "Cast Builder",
    body: "Upload avatars, set role colors, and add BOT / ADMIN badges — just like a real server.",
  },
  {
    Icon: IconClapper,
    title: "Storyboard Editor",
    body: "Direct the scene on a visual timeline. Auto-timing scales to text length for lifelike typing beats.",
  },
  {
    Icon: IconBolt,
    title: "Quick Add",
    body: "Paste plain dialogue and watch it split into events — new names become cast automatically.",
  },
  {
    Icon: IconPhone,
    title: "Rolling Window",
    body: "Only the newest few messages stay on screen, mimicking a real chat instead of a wall of text.",
  },
  {
    Icon: IconPlay,
    title: "True Preview",
    body: "One timeline clock powers play, pause, and scrub — the preview is the render.",
  },
  {
    Icon: IconShield,
    title: "Nothing Is Uploaded",
    body: "Avatars, scripts, and renders all stay on your device. No account, no server, no watermark.",
  },
]

const FAQ = [
  {
    q: "Do I need to install anything?",
    a: "No. ChatTale is a website. Open it, build a story, and export — the whole thing runs locally in your browser and works offline once loaded.",
  },
  {
    q: "What format does the export use?",
    a: "A .webm video, recorded in your browser. Browsers can't encode MP4 natively without extra tooling, so we ship WebM: it plays on the web, in VLC, and uploads directly to most platforms.",
  },
  {
    q: "How long does an export take?",
    a: "It records in real time, so a 20-second story takes about 20 seconds. Chrome and Edge give the best results. Keep the tab in the foreground while it renders.",
  },
  {
    q: "Is my story saved anywhere?",
    a: "Only in your browser. Your project autosaves to localStorage as you work, so a refresh or a closed tab won't lose it. Use Start over to clear it.",
  },
  {
    q: "Can I import a script I already wrote?",
    a: "Yes. Open Quick add in the storyboard step and drop in plain text — one line per beat, either Name: message or [Name joins]. You can also upload a .txt file or download the template.",
  },
  {
    q: "What are the keyboard shortcuts?",
    a: "On the preview screen: Space plays and pauses, R restarts, the arrow keys scrub half a second at a time, and M mutes the message ping.",
  },
]

function Faq() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <div className="mx-auto max-w-3xl divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02]">
      {FAQ.map((item, i) => {
        const isOpen = open === i
        return (
          <div key={item.q}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-white/[0.03]"
            >
              <span className="flex-1 text-sm font-medium text-txt sm:text-base">
                {item.q}
              </span>
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/10 text-txt-faint transition-transform duration-200 ${
                  isOpen ? "rotate-45" : ""
                }`}
                aria-hidden="true"
              >
                +
              </span>
            </button>
            {isOpen && (
              <p className="ct-fade px-5 pb-5 text-sm leading-relaxed text-txt-muted">
                {item.a}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function Landing({ onStart }: { onStart: () => void }) {
  return (
    <div className="relative z-10">
      {/* HERO */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pt-16 pb-24 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:pt-24">
        <div className="ct-rise">
          <Pill>
            <span className="h-1.5 w-1.5 rounded-full bg-online" /> New ·
            Discord story engine
          </Pill>
          <h1 className="mt-6 font-display text-5xl leading-[1.05] font-bold tracking-tight text-white sm:text-6xl">
            Turn a chat into a{" "}
            <span className="ct-gradient-text">scroll-stopping</span> story
            video.
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-txt-muted">
            ChatTale builds fake Discord conversations that play out one message
            at a time — typing dots, pop-ins, reactions — ready for Shorts,
            Reels, and TikTok.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Btn size="lg" onClick={onStart}>
              Start creating <IconArrowRight size={18} />
            </Btn>
            <a
              href="#how"
              className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-base font-semibold text-txt-muted transition hover:bg-white/5 hover:text-txt"
            >
              <IconPlay size={16} /> See how it works
            </a>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-txt-faint">
            <span className="flex items-center gap-2">
              <span className="text-online">✓</span> No editing skills
            </span>
            <span className="flex items-center gap-2">
              <span className="text-online">✓</span> Vertical &amp; square
            </span>
            <span className="flex items-center gap-2">
              <span className="text-online">✓</span> Live preview
            </span>
          </div>
        </div>
        <div className="flex justify-center lg:justify-end">
          <HeroMock />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how"
        className="mx-auto max-w-6xl scroll-mt-24 px-5 pb-24 sm:px-6"
      >
        <div className="mb-12 text-center">
          <div className="text-xs font-semibold tracking-[0.12em] text-blurple-hi uppercase">
            How it works
          </div>
          <h2 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
            Three steps, start to story
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-txt-muted">
            No timeline software, no keyframes, no render farm. The conversation
            is the script.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Card
              key={s.n}
              className="ct-rise relative overflow-hidden p-6"
              style={{ animationDelay: `${i * 90}ms` }}
            >
              <div className="absolute -right-3 -top-5 font-display text-7xl font-bold text-white/[0.04]">
                {s.n}
              </div>
              <div className="relative mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blurple/15 text-blurple-hi ring-1 ring-blurple/30">
                <s.Icon size={22} />
              </div>
              <h3 className="relative font-display text-lg font-semibold text-white">
                {s.title}
              </h3>
              <p className="relative mt-2 text-sm leading-relaxed text-txt-muted">
                {s.body}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section
        id="features"
        className="mx-auto max-w-6xl scroll-mt-24 px-5 pb-24 sm:px-6"
      >
        <div className="mb-10 text-center">
          <div className="text-xs font-semibold tracking-[0.12em] text-blurple-hi uppercase">
            The toolkit
          </div>
          <h2 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
            Everything to direct the scene
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Card
              key={f.title}
              className="group p-6 transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blurple/15 text-blurple-hi ring-1 ring-blurple/30 transition group-hover:bg-blurple/25">
                <f.Icon size={22} />
              </div>
              <h3 className="font-display text-lg font-semibold text-white">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-txt-muted">
                {f.body}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section
        id="faq"
        className="mx-auto max-w-6xl scroll-mt-24 px-5 pb-24 sm:px-6"
      >
        <div className="mb-10 text-center">
          <div className="text-xs font-semibold tracking-[0.12em] text-blurple-hi uppercase">
            FAQ
          </div>
          <h2 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
            Questions, answered
          </h2>
        </div>
        <Faq />
      </section>

      {/* CTA */}
      <section
        id="start"
        className="mx-auto max-w-6xl scroll-mt-24 px-5 pb-24 sm:px-6"
      >
        <Card glow className="overflow-hidden p-10 text-center sm:p-16">
          <div className="mx-auto max-w-2xl">
            <div className="mb-5 flex justify-center">
              <Pill>
                <IconShield size={13} /> 100% in your browser
              </Pill>
            </div>
            <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
              Your first story is three steps away.
            </h2>
            <p className="mt-4 text-txt-muted">
              Build the cast, write the scene, hit play. That's the whole
              workflow.
            </p>
            <div className="mt-8 flex justify-center">
              <Btn size="lg" onClick={onStart}>
                Open the studio <IconArrowRight size={18} />
              </Btn>
            </div>
          </div>
        </Card>
      </section>
    </div>
  )
}
