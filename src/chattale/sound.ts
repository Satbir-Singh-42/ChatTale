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

export function playMessagePing() {
  const a = audio()
  if (!a) return
  if (a.state === "suspended") void a.resume()

  const now = a.currentTime
  // two ascending notes with a soft, quick decay
  const notes = [
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
    gain.gain.linearRampToValueAtTime(0.16, start + 0.012)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + n.dur)
    osc.connect(gain).connect(a.destination)
    osc.start(start)
    osc.stop(start + n.dur + 0.03)
  }
}
