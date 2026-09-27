# ChatTale

ChatTale is a browser-only studio that turns scripted, Discord-style
conversations into short "chat story" videos. React + Vite + Tailwind CSS.

## Development server

`pnpm dev` starts a Vite dev server on `$PORT` (default 5173). HMR reflects
source changes immediately.

Other scripts:

```bash
pnpm build      # production build to dist/
pnpm preview    # serve the production build locally
pnpm typecheck  # tsc --noEmit
pnpm format     # oxfmt over the source paths, then tsc --noEmit
```

**Do not run `oxfmt` without explicit paths.** The pinned oxfmt 0.2.0 has no
ignore list — a bare `oxfmt` rewrites `node_modules` and `dist`. It also strips
the `;` separators from single-line TypeScript type literals, which is a syntax
error, so the `format` script always chains `tsc --noEmit` behind it.

## Project structure

This is the canonical project structure. Start with task-relevant files below.
Only follow imports or inspect other files when required, when a documented
path is missing, or when the repository contradicts this guide.

- `src/main.tsx` - React entrypoint; imports `src/index.css` and mounts `src/App.tsx` into the `#root` element
- `src/App.tsx` - Primary application component: the three studio steps (cast / story / preview) and their state
- `src/index.css` - Global CSS entrypoint, Tailwind CSS v4 import, theme tokens, keyframes
- `index.html` - Vite HTML shell containing the `#root` element and loading `src/main.tsx`
- `public/` - Static assets served at the site root (`favicon.svg`)
- `package.json` - Project dependencies and the Vite build, development, preview, and formatting scripts
- `vite.config.ts` - Vite configuration with React, Tailwind CSS v4, and the `@` alias for `src`
- `.mise.toml` - Toolchain versions for Node.js and pnpm

### Studio modules (`src/chattale/`)

- `types.ts` - `CastMember`, `StoryEvent`, `Settings`, `TimedEvent`
- `lib.ts` - Timeline math (`buildTimeline`), duration helpers, script parser, defaults
- `ChatStage.tsx` - The single render surface used by the landing demo, the live preview, **and** the video export
- `Landing.tsx` - Marketing page (hero, how it works, features, FAQ, CTA, footer)
- `ui.tsx` - Shared primitives: `Btn`, `Card`, `Field`, `Pill`, `SectionHead`
- `Dropdown.tsx` - Portal-based select (escapes overflow clipping)
- `ColorField.tsx` - Custom color picker (presets + hex)
- `icons.tsx` - Inline SVG icon set
- `sound.ts` - Web Audio message ping (synthesized, no asset)
- `storage.ts` - localStorage autosave/load/reset for the active project

## Dependencies

- Runtime: React 19, React DOM 19, and `html-to-image` (DOM → canvas for export)
- Styling: Tailwind CSS v4 with the `@tailwindcss/vite` plugin
- Build tooling: Vite 8, TypeScript 5.7, and `@vitejs/plugin-react`
- Formatting: oxfmt

No backend and no server-side rendering — every feature must work offline in
the browser.

## Styling

This project uses **Tailwind CSS v4** through the `@tailwindcss/vite` plugin
configured in `vite.config.ts`. `src/index.css` imports Tailwind with
`@import 'tailwindcss';`. Use Tailwind utility classes directly in JSX and put
global CSS or Tailwind v4 theme customization in `src/index.css`. There is no
Tailwind config file and no PostCSS config.

Color tokens live in the `@theme` block in `src/index.css` (`ink`, `panel`,
`blurple`, `txt`, `hair`, `online`, …). Use those tokens rather than raw hex
values so the chat surface stays on-palette. Reusable visual utilities that
span more than one class live as `ct-*` classes in the same file.

`src/main.tsx` imports `src/index.css`, so global font wiring belongs in
`src/index.css`. Keep CSS `@import` statements first, then add any `@font-face`
rules and font-family defaults there.

## Architecture notes

- **One timeline clock.** `buildTimeline(events, typingSpeed)` assigns
  `typingStart` / `typingEnd` / `revealAt` / `end` to every beat. A single `t`
  value drives `ChatStage`. Preview and export both read the same `TimedEvent[]`,
  so they cannot drift.
- **`ChatStage` must stay pure with respect to `t`.** Anything animated in the
  export (pop-ins, typing dots) is CSS-driven so it rasterizes correctly. Do not
  put `setInterval`/timers inside it.
- **Export is WebM.** The browser cannot encode MP4 client-side; the recorder
  uses `canvas.captureStream` + `MediaRecorder`. Do not claim MP4 in the UI.
- **Project state is autosaved** to localStorage via `src/chattale/storage.ts`.
  Read the saved project on boot and write it on change, guarded against
  quota/parse failures.

## Code quality

- Use double quotes for strings containing apostrophes (`"We're here to help"`),
  or escape them in single-quoted strings. An unescaped apostrophe in a
  single-quoted string breaks the build.
- Ensure JSX tags are closed and braces are balanced.
- Export components as default exports.
- Run `pnpm typecheck` and `pnpm build` before calling a change done.
