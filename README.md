# ChatTale

Turn scripted, Discord-style conversations into shareable **story videos** — entirely in the browser. Build a cast, storyboard the chat beat by beat, preview it on a single timeline clock, and export a video. No backend, no install.

## Why it exists

Chat-story videos (the "texting story" format popular on Reels, Shorts, and TikTok) are tedious to make by hand. ChatTale treats a conversation as a **timeline of beats** — messages, joins, leaves, and reactions — and renders that timeline both live in the preview and into a recorded video, so the thing you see is exactly the thing you export.

## Features

- **Cast Builder** — create characters with avatars (uploaded images or auto initials), Discord role colors, and badges (BOT / ADMIN / MOD / OP).
- **Storyboard Editor** — add message / join / leave / reaction beats, reorder them, and insert a beat *between* any two others via the hover **+** affordance. Press <kbd>Enter</kbd> in a message to spin up the next one without reaching for the mouse.
- **Quick add** — paste or upload a plain-text script (`Name: message`, `[Name joins]`) and it becomes beats + cast automatically. Download a template to get the format.
- **One timeline clock** — typing and read durations auto-scale to text length, so playback feels human. A **Typing speed** control (Slow / Normal / Fast / Turbo) rescales the whole timeline.
- **Live preview** — scrub, play/pause, restart, and a Discord-style message ping. Compact settings for **aspect ratio** (9:16 / 1:1 / 16:9), **flow** (stack vs. one-at-a-time), and **alignment** (left / center).
- **Keyboard transport** — <kbd>Space</kbd> play/pause, <kbd>R</kbd> restart, <kbd>←</kbd>/<kbd>→</kbd> scrub, <kbd>M</kbd> mute. Shortcuts are ignored while you're typing in a field.
- **Autosave** — the whole project (cast, beats, settings, current step) is written to `localStorage` on every change, so a refresh or a closed tab won't lose work. **Start over** clears it.
- **In-browser video export** — records the live preview to a `.webm` via `canvas.captureStream` + `MediaRecorder`. See [Exporting video](#exporting-video) for the caveats.

## Tech stack

| Concern     | Choice                                    |
| ----------- | ----------------------------------------- |
| UI          | React 19                                  |
| Build/dev   | Vite 8, TypeScript 5.7                     |
| Styling     | Tailwind CSS v4 (`@tailwindcss/vite`)     |
| Rasterizing | `html-to-image` (DOM → canvas for export) |
| Formatting  | oxfmt 0.2 (see the caveat above)           |

## Getting started

```bash
pnpm install
pnpm dev        # start the Vite dev server on $PORT (default 5173)
```

Other scripts:

```bash
pnpm build      # production build to dist/
pnpm preview    # serve the production build locally
pnpm typecheck  # tsc --noEmit
pnpm format     # oxfmt, then tsc --noEmit (see the caveat below)
```

> **Formatter caveat.** The pinned `oxfmt` 0.2.0 strips the `;` separators out of
> single-line TypeScript type literals (`{ a: number; b: number }` →
> `{ a: number b: number }`), which is a syntax error. It also has no default
> ignore list and will happily rewrite `node_modules` and `dist`. The `format`
> script is therefore scoped to source paths and always followed by
> `tsc --noEmit`, so any damage it causes fails the command instead of
> silently breaking the build. If you hit `TS1005: ';' expected` after
> formatting, restore the `;` characters by hand.

## Project structure

```
index.html            # HTML shell + SEO meta; mounts /src/main.tsx
public/
  favicon.svg         # site icon
src/
  main.tsx            # React entrypoint; imports index.css, mounts <App/>
  index.css           # Tailwind v4 import, fonts, global tokens/animations
  App.tsx             # App shell + the three steps: Cast / Story / Preview
  chattale/
    types.ts          # CastMember, StoryEvent, Settings, TimedEvent
    lib.ts            # timeline math (buildTimeline), script parser, defaults
    ChatStage.tsx     # the render surface used by preview AND export
    Landing.tsx       # marketing page: hero, how it works, features, FAQ, CTA
    Footer.tsx        # site footer, shared by the landing page and studio
    ui.tsx            # Btn, Card, Field, Pill, SectionHead
    Dropdown.tsx      # portal-based select (escapes overflow clipping)
    ColorField.tsx    # custom color picker (presets + hex)
    icons.tsx         # inline SVG icon set
    sound.ts          # Web Audio message ping (no asset)
    storage.ts        # localStorage autosave / load / reset
```

## How the timeline works

`buildTimeline(events, typingSpeed)` walks the beats and assigns each one four
timestamps — `typingStart`, `typingEnd`, `revealAt`, `end` — producing a
`TimedEvent[]` plus a `total` duration. A single `t` clock (driven by
`requestAnimationFrame`) advances through that timeline; `ChatStage` renders
whatever should be on screen at `t`. Because preview and export both read the
same `TimedEvent[]`, they can never drift apart.

This shape is deliberately export-friendly: the same JSON could feed a
server-side renderer for frame-accurate MP4 output if you ever add a backend.

## Saving your work

There is no account and no server. `src/chattale/storage.ts` writes the project
— cast, beats, scene settings, and the current step — to `localStorage` under
`chattale.project.v1` on every change, and reads it back on boot so a reload
resumes exactly where you left off. All reads are schema-checked and all writes
are wrapped, so a corrupt or full store degrades to "no saved project" instead
of breaking the app. **Start over** in the studio header clears the entry and
reloads the sample story.

## Exporting video

Export plays the timeline in real time while rasterizing the preview frame to an
offscreen canvas each frame; that canvas's stream feeds a `MediaRecorder`.

- **Format is `.webm`**, not `.mp4`. Browsers cannot natively encode MP4 on the
  client — that final transcode needs ffmpeg or a server. WebM plays on the web,
  in VLC, and uploads directly to most platforms.
- **No audio** in the export (the ping is preview-only).
- **Runs in real time** — a 20s story takes ~20s to render. Chrome/Edge give the
  best results.

## License

Private project.
# ChatTale
