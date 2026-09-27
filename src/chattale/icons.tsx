type IconProps = { className?: string, size?: number }

const svg = (path: React.ReactNode) =>
  function Icon({ className = "", size = 18 }: IconProps) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        {path}
      </svg>
    )
  }

export const IconChat = svg(
  <>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </>,
)
export const IconPlay = svg(
  <polygon points="6 4 20 12 6 20 6 4" fill="currentColor" stroke="none" />,
)
export const IconPause = svg(
  <>
    <rect
      x="6"
      y="5"
      width="4"
      height="14"
      rx="1"
      fill="currentColor"
      stroke="none"
    />
    <rect
      x="14"
      y="5"
      width="4"
      height="14"
      rx="1"
      fill="currentColor"
      stroke="none"
    />
  </>,
)
export const IconRestart = svg(
  <>
    <path d="M3 12a9 9 0 1 0 3-6.7" />
    <path d="M3 3v5h5" />
  </>,
)
export const IconChevronUp = svg(<path d="M6 15l6-6 6 6" />)
export const IconChevronDown = svg(<path d="M6 9l6 6 6-6" />)
export const IconClose = svg(<path d="M6 6l12 12M18 6L6 18" />)
export const IconPlus = svg(<path d="M12 5v14M5 12h14" />)
export const IconArrowRight = svg(<path d="M5 12h14M13 6l6 6-6 6" />)
export const IconEnter = svg(
  <>
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <path d="M10 17l5-5-5-5" />
    <path d="M15 12H3" />
  </>,
)
export const IconExit = svg(
  <>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </>,
)
export const IconSpark = svg(
  <>
    <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />
    <path d="M19 15l.7 1.8L21.5 17.5 19.7 18.2 19 20l-.7-1.8L16.5 17.5l1.8-.7z" />
  </>,
)
export const IconDownload = svg(
  <>
    <path d="M12 3v12" />
    <path d="M7 10l5 5 5-5" />
    <path d="M5 21h14" />
  </>,
)
export const IconImage = svg(
  <>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none" />
    <path d="M21 15l-5-5L5 21" />
  </>,
)
export const IconSmile = svg(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <path d="M9 9h.01M15 9h.01" />
  </>,
)
export const IconMessage = svg(
  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
)
export const IconClock = svg(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </>,
)
export const IconCheck = svg(<path d="M20 6L9 17l-5-5" />)
export const IconMask = svg(
  <>
    <path d="M4 5s2-1 8-1 8 1 8 1v6a8 8 0 0 1-16 0z" />
    <path d="M8 9h.01M16 9h.01" />
    <path d="M9 14s1 1 3 1 3-1 3-1" />
  </>,
)
export const IconClapper = svg(
  <>
    <rect x="3" y="8" width="18" height="12" rx="2" />
    <path d="M3 8l3-4h4l-3 4M11 8l3-4h4l-3 4" />
  </>,
)
export const IconBolt = svg(
  <path d="M13 2L4 14h7l-1 8 9-12h-7z" fill="currentColor" stroke="none" />,
)
export const IconPhone = svg(
  <>
    <rect x="7" y="2" width="10" height="20" rx="2" />
    <path d="M11 18h2" />
  </>,
)
export const IconTrash = svg(
  <>
    <path d="M3 6h18" />
    <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
  </>,
)
export const IconVolume = svg(
  <>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
  </>,
)
export const IconShield = svg(
  <>
    <path d="M12 3l7.5 3v6c0 4.5-3.1 8.2-7.5 9.4C7.6 20.2 4.5 16.5 4.5 12V6z" />
    <path d="M9 12l2 2 4-4" />
  </>,
)
