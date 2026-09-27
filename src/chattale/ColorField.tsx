import { useEffect, useRef, useState } from "react"
import { IconCheck } from "./icons"

// Curated backdrop tones — chat-surface darks plus a few cinematic hues.
const PRESETS = [
  "#313338", // Discord default
  "#2b2d31",
  "#1e1f22",
  "#0a0a0f",
  "#000000",
  "#12233b", // deep navy
  "#1a1030", // plum
  "#0f2a24", // forest
  "#2a1220", // wine
]

const isHex = (v: string) => /^#[0-9a-fA-F]{6}$/.test(v)

/**
 * Custom color control: preset swatch grid + a live hex input + a native-picker
 * escape hatch. Replaces the raw <input type="color"> for a polished feel.
 */
export default function ColorField({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  const [draft, setDraft] = useState(value)
  const nativeRef = useRef<HTMLInputElement>(null)

  useEffect(() => setDraft(value), [value])

  const commit = (v: string) => {
    setDraft(v)
    if (isHex(v)) onChange(v.toLowerCase())
  }

  return (
    <div className="space-y-2.5">
      <div className="grid grid-cols-9 gap-1.5">
        {PRESETS.map((c) => {
          const sel = c === value.toLowerCase()
          return (
            <button
              key={c}
              type="button"
              onClick={() => onChange(c)}
              aria-label={c}
              className={`relative aspect-square rounded-lg ring-1 transition hover:scale-105 ${
                sel ? "ring-2 ring-blurple" : "ring-white/10"
              }`}
              style={{ background: c }}
            >
              {sel && (
                <IconCheck
                  size={13}
                  className="absolute inset-0 m-auto text-white drop-shadow"
                />
              )}
            </button>
          )
        })}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => nativeRef.current?.click()}
          className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg ring-1 ring-white/15 transition hover:ring-white/30"
          style={{ background: value }}
          aria-label="Pick a custom color"
        >
          <input
            ref={nativeRef}
            type="color"
            value={isHex(value) ? value : "#313338"}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </button>
        <div className="flex flex-1 items-center rounded-lg border border-hair bg-black/25 px-2.5 focus-within:border-blurple">
          <span className="text-sm text-txt-faint">#</span>
          <input
            value={draft.replace(/^#/, "")}
            onChange={(e) =>
              commit(
                "#" + e.target.value.replace(/[^0-9a-fA-F]/g, "").slice(0, 6),
              )
            }
            spellCheck={false}
            className="w-full bg-transparent py-1.5 font-mono text-sm uppercase text-txt outline-none"
            placeholder="313338"
          />
        </div>
      </div>
    </div>
  )
}
