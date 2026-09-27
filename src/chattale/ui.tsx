import type { CSSProperties, ReactNode } from "react"

export function Btn({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled,
  className = "",
}: {
  children: ReactNode
  onClick?: () => void
  variant?: "primary" | "ghost" | "outline"
  size?: "md" | "lg"
  disabled?: boolean
  className?: string
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 active:scale-[0.97]"
  const sizes = { md: "px-4 py-2 text-sm", lg: "px-6 py-3 text-base" }
  const variants = {
    primary:
      "bg-blurple text-white shadow-[0_8px_24px_-8px_rgba(88,101,242,0.7)] hover:bg-blurple-hi hover:shadow-[0_10px_30px_-6px_rgba(88,101,242,0.8)]",
    ghost: "bg-white/5 text-txt hover:bg-white/10",
    outline:
      "border border-hair-2 text-txt hover:border-blurple hover:bg-blurple/10",
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

export function Field({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="block">
      <span className="mb-1.5 block text-[11px] font-semibold tracking-[0.08em] text-txt-faint uppercase">
        {label}
      </span>
      {children}
    </div>
  )
}

export function Card({
  children,
  className = "",
  glow,
  style,
}: {
  children: ReactNode
  className?: string
  glow?: boolean
  style?: CSSProperties
}) {
  return (
    <div
      style={style}
      className={`ct-glass ct-card-hl rounded-2xl ${
        glow ? "shadow-[0_0_50px_-12px_rgba(88,101,242,0.4)]" : ""
      } ${className}`}
    >
      {children}
    </div>
  )
}

export function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-hair-2 bg-white/5 px-3 py-1 text-xs font-medium text-txt-muted">
      {children}
    </span>
  )
}

export function SectionHead({
  eyebrow,
  title,
  sub,
  action,
}: {
  eyebrow?: string
  title: string
  sub: string
  action?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <div className="mb-2 text-xs font-semibold tracking-[0.12em] text-blurple-hi uppercase">
            {eyebrow}
          </div>
        )}
        <h2 className="font-display text-3xl font-bold tracking-tight text-white">
          {title}
        </h2>
        <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-txt-muted">
          {sub}
        </p>
      </div>
      {action}
    </div>
  )
}
