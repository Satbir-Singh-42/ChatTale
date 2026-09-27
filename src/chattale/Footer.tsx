import { IconChat } from "./icons"

type FooterProps = {
  /** Switch back to the marketing page; passed by the studio shell. */
  onHome: () => void
}

const COLUMNS: { title: string, links: { label: string, id: string }[] }[] = [
  {
    title: "Product",
    links: [
      { label: "How it works", id: "how" },
      { label: "Features", id: "features" },
      { label: "FAQ", id: "faq" },
      { label: "Open the studio", id: "start" },
    ],
  },
  {
    title: "Workflow",
    links: [
      { label: "Step 1 · Cast", id: "how" },
      { label: "Step 2 · Storyboard", id: "how" },
      { label: "Step 3 · Preview & export", id: "how" },
      { label: "Export format", id: "faq" },
    ],
  },
]

export default function Footer({ onHome }: FooterProps) {
  // Footer links are real anchors so they behave normally on the marketing
  // page. From inside the studio we bounce home first, then scroll once the
  // target section has actually mounted.
  const go = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    onHome()
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
    }, 0)
  }

  return (
    <footer className="relative z-10 mt-auto border-t border-white/5">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-3 sm:px-6">
        <div>
          <div className="flex items-center gap-2.5">
            <img src="/favicon.svg" alt="ChatTale logo" className="h-8 w-8" />
            <span className="font-display text-base font-bold text-white">
              ChatTale
            </span>
          </div>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-txt-muted">
            Scripted chat, rendered as a story. Everything runs in your browser
            — no account, no upload, no watermark.
          </p>
        </div>

        {COLUMNS.map((col) => (
          <nav key={col.title}>
            <h4 className="text-[11px] font-semibold tracking-[0.1em] text-txt-faint uppercase">
              {col.title}
            </h4>
            <ul className="mt-3 space-y-2">
              {col.links.map((l) => (
                <li key={l.label}>
                  <a
                    href={`#${l.id}`}
                    onClick={(e) => go(e, l.id)}
                    className="text-sm text-txt-muted transition hover:text-txt"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-white/5">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-5 text-xs text-txt-faint sm:flex-row sm:px-6">
          <p>
            &copy; {new Date().getFullYear()} ChatTale. All rights reserved.
          </p>
          <p>
            Built with React, Vite &amp; Tailwind. Exports{" "}
            <span className="text-txt-muted">.webm</span> — rendered on your
            device.
          </p>
        </div>
      </div>
    </footer>
  )
}
