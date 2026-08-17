import type { AnimationKind } from '@/domain/powers/powers.catalog'

type EffectSpec = {
  animation: string
  duration: string
  className: string
  glyph: string
}

/**
 * Cada `AnimationKind` do catálogo vira uma combinação de keyframe, forma e glifo.
 * Um componente cobre os quinze poderes — a variação é dado, não código.
 */
const EFFECTS: Record<AnimationKind, EffectSpec> = {
  slash: { animation: 'power-slash', duration: '0.45s', className: 'h-1.5 w-24 rounded-full', glyph: '' },
  wave: { animation: 'power-sweep', duration: '0.6s', className: 'h-16 w-24 rounded-full opacity-70', glyph: '' },
  bubble: { animation: 'power-burst', duration: '0.5s', className: 'size-16 rounded-full opacity-70', glyph: '' },
  ember: { animation: 'power-burst', duration: '0.45s', className: 'size-12 rounded-full', glyph: '' },
  blaze: { animation: 'power-burst', duration: '0.6s', className: 'size-24 rounded-full opacity-80', glyph: '' },
  leaf: { animation: 'power-sweep', duration: '0.5s', className: 'h-2 w-28 rounded-full', glyph: '' },
  bloom: { animation: 'power-burst', duration: '0.65s', className: 'size-20 rounded-full opacity-75', glyph: '✦' },
  rock: { animation: 'power-drop', duration: '0.55s', className: 'size-10', glyph: '◆' },
  quake: { animation: 'power-drop', duration: '0.7s', className: 'size-16', glyph: '◆' },
  spark: { animation: 'power-burst', duration: '0.35s', className: 'size-10 rounded-full', glyph: '⚡' },
  bolt: { animation: 'power-drop', duration: '0.5s', className: 'size-14', glyph: '⚡' },
}

type PowerEffectProps = {
  kind: AnimationKind
  color: string
}

export const PowerEffect = ({ kind, color }: PowerEffectProps) => {
  const effect = EFFECTS[kind]
  const isGlyph = effect.glyph !== ''

  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute top-1/2 left-1/2 grid place-items-center text-3xl ${effect.className}`}
      style={{
        background: isGlyph ? 'transparent' : color,
        color,
        boxShadow: isGlyph ? 'none' : `0 0 24px ${color}`,
        animation: `${effect.animation} ${effect.duration} ease-out forwards`,
      }}
    >
      {effect.glyph}
    </span>
  )
}
