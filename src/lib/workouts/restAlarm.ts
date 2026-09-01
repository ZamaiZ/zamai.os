"use client"

let audioContext: AudioContext | null = null
let alarmTimer: number | null = null

export function getRestAudioContext(): AudioContext | null {
  try {
    if (typeof window === "undefined") return null
    const Context =
      window.AudioContext ??
      (window as Window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext
    if (!Context) return null
    if (!audioContext) {
      audioContext = new Context()
    }
    void audioContext.resume()
    return audioContext
  } catch {
    return null
  }
}

function playTwoTone(context: AudioContext) {
  const now = context.currentTime
  const gain = context.createGain()
  gain.gain.setValueAtTime(0.08, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32)
  gain.connect(context.destination)

  const tones = [880, 1175]
  for (const [index, frequency] of tones.entries()) {
    const oscillator = context.createOscillator()
    oscillator.type = "sine"
    oscillator.frequency.value = frequency
    oscillator.connect(gain)
    const start = now + index * 0.14
    oscillator.start(start)
    oscillator.stop(start + 0.12)
  }
}

function ping() {
  const context = getRestAudioContext()
  if (context) playTwoTone(context)
  navigator.vibrate?.([200, 120, 200])
}

export function startRestAlarm() {
  stopRestAlarm()
  ping()
  alarmTimer = window.setInterval(ping, 1000)
}

export function stopRestAlarm() {
  if (alarmTimer != null) {
    window.clearInterval(alarmTimer)
    alarmTimer = null
  }
}
