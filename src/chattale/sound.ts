// Synthesized, Discord-flavored message "ping" — a quick two-note blip.
// Built with the Web Audio API so no external audio asset is needed.
let ctx: AudioContext | null = null

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null
  if (!ctx) {
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  return ctx
}

let dest: MediaStreamAudioDestinationNode | null = null

export function getAudioStream() {
  const a = audio()
  if (!a) return null
  if (!dest) dest = a.createMediaStreamDestination()
  return dest.stream
}

export function playMessagePing(isMention = false) {
  const a = audio()
  if (!a) return
  if (a.state === "suspended") void a.resume()

  if (!dest) dest = a.createMediaStreamDestination()

  const now = a.currentTime
  // Distinctive Discord chime: 3 bright ascending notes for mentions, 2 soft notes for regular
  const notes = isMention
    ? [
        { f: 659.25, at: 0, dur: 0.08 }, // E5
        { f: 880.0, at: 0.06, dur: 0.16 }, // A5
        { f: 1046.5, at: 0.12, dur: 0.22 }, // C6
      ]
    : [
        { f: 587.33, at: 0, dur: 0.09 }, // D5
        { f: 783.99, at: 0.07, dur: 0.15 }, // G5
      ]

  for (const n of notes) {
    const osc = a.createOscillator()
    const gain = a.createGain()
    osc.type = "sine"
    osc.frequency.value = n.f
    const start = now + n.at
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.linearRampToValueAtTime(isMention ? 0.22 : 0.16, start + 0.012)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + n.dur)

    // Connect to speakers
    osc.connect(gain).connect(a.destination)
    // Connect to the stream destination for video recording
    gain.connect(dest)

    osc.start(start)
    osc.stop(start + n.dur + 0.03)
  }
}
