import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import type { ReactNode } from "react"
import { IconCheck, IconChevronDown } from "./icons"

export type DropdownOption = {
  value: string
  label: string
  leading?: ReactNode
}

type Pos = { left: number, top: number, width: number, drop: "down" | "up" }

export default function Dropdown({
  value,
  options,
  onChange,
  placeholder = "Select…",
  className = "",
}: {
  value: string
  options: DropdownOption[]
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const [pos, setPos] = useState<Pos | null>(null)
  const root = useRef<HTMLDivElement>(null)
  const menu = useRef<HTMLDivElement>(null)
  const selected = options.find((o) => o.value === value)

  // Position the portal menu relative to the trigger, flipping up when the
  // space below is too tight. Runs on open and on scroll/resize.
  const place = () => {
    const el = root.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const estH = Math.min(240, options.length * 40 + 8)
    const below = window.innerHeight - r.bottom
    const drop: "down" | "up" =
      below < estH + 12 && r.top > below ? "up" : "down"
    setPos({
      left: r.left,
      top: drop === "down" ? r.bottom + 6 : r.top - 6,
      width: r.width,
      drop,
    })
  }

  useLayoutEffect(() => {
    if (open) place()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    if (!open) return
    const onMove = () => place()
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node
      if (root.current?.contains(target)) return
      if (menu.current?.contains(target)) return
      setOpen(false)
    }
    window.addEventListener("scroll", onMove, true)
    window.addEventListener("resize", onMove)
    document.addEventListener("mousedown", onDoc)
    return () => {
      window.removeEventListener("scroll", onMove, true)
      window.removeEventListener("resize", onMove)
      document.removeEventListener("mousedown", onDoc)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    if (open)
      setActive(
        Math.max(
          0,
          options.findIndex((o) => o.value === value),
        ),
      )
  }, [open, value, options])

  const commit = (v: string) => {
    onChange(v)
    setOpen(false)
  }

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || (e.key === "Enter" && !open)) {
      e.preventDefault()
      if (!open) setOpen(true)
      else setActive((a) => Math.min(options.length - 1, a + 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActive((a) => Math.max(0, a - 1))
    } else if (e.key === "Enter" && open) {
      e.preventDefault()
      const opt = options[active]
      if (opt) commit(opt.value)
    } else if (e.key === "Escape") {
      setOpen(false)
    }
  }

  return (
    <div ref={root} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onKey}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex w-full items-center gap-2 rounded-lg border bg-black/25 px-2.5 py-1.5 text-left text-sm text-txt transition ${
          open
            ? "border-blurple shadow-[0_0_0_3px_rgba(88,101,242,0.18)]"
            : "border-hair hover:border-hair-2"
        }`}
      >
        {selected?.leading}
        <span
          className={`min-w-0 flex-1 truncate ${
            selected ? "" : "text-txt-faint"
          }`}
        >
          {selected?.label ?? placeholder}
        </span>
        <IconChevronDown
          size={15}
          className={`shrink-0 text-txt-faint transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open &&
        pos &&
        createPortal(
          <div
            ref={menu}
            role="listbox"
            className="ct-glass fixed z-[100] max-h-60 overflow-auto rounded-xl border border-white/10 p-1 shadow-2xl"
            style={{
              left: pos.left,
              top: pos.drop === "down" ? pos.top : undefined,
              bottom:
                pos.drop === "up" ? window.innerHeight - pos.top : undefined,
              minWidth: pos.width,
              animation: "ct-pop 0.16s ease-out both",
            }}
          >
            {options.map((opt, i) => {
              const isSel = opt.value === value
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={isSel}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => commit(opt.value)}
                  className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm transition ${
                    i === active
                      ? "bg-blurple text-white"
                      : "text-txt hover:bg-white/5"
                  }`}
                >
                  {opt.leading}
                  <span className="min-w-0 flex-1 truncate">{opt.label}</span>
                  {isSel && <IconCheck size={14} className="shrink-0" />}
                </button>
              )
            })}
          </div>,
          document.body,
        )}
    </div>
  )
}
