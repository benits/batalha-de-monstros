export type SfxName = 'hit' | 'crit' | 'weak' | 'select' | 'win'

type Tone = { frequency: number; duration: number; type: OscillatorType; delay: number }

/** Blips de arcade descritos como dados — nenhum arquivo de áudio no repositório. */
const RECIPES: Record<SfxName, Tone[]> = {
  hit: [{ frequency: 220, duration: 0.08, type: 'square', delay: 0 }],
  crit: [
    { frequency: 320, duration: 0.07, type: 'square', delay: 0 },
    { frequency: 540, duration: 0.1, type: 'square', delay: 0.06 },
  ],
  weak: [{ frequency: 140, duration: 0.1, type: 'triangle', delay: 0 }],
  select: [{ frequency: 660, duration: 0.05, type: 'square', delay: 0 }],
  win: [
    { frequency: 523, duration: 0.1, type: 'square', delay: 0 },
    { frequency: 659, duration: 0.1, type: 'square', delay: 0.1 },
    { frequency: 784, duration: 0.22, type: 'square', delay: 0.2 },
  ],
}

let context: AudioContext | null = null

const getContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null
  context ??= new AudioContext()
  if (context.state === 'suspended') void context.resume()
  return context
}

export const playSfx = (name: SfxName): void => {
  const audio = getContext()
  if (!audio) return

  for (const tone of RECIPES[name]) {
    const oscillator = audio.createOscillator()
    const gain = audio.createGain()
    const startAt = audio.currentTime + tone.delay

    oscillator.type = tone.type
    oscillator.frequency.setValueAtTime(tone.frequency, startAt)
    gain.gain.setValueAtTime(0.06, startAt)
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + tone.duration)

    oscillator.connect(gain).connect(audio.destination)
    oscillator.start(startAt)
    oscillator.stop(startAt + tone.duration)
  }
}
