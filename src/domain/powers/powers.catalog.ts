import { ELEMENT_CYCLE, type Element } from '@/domain/monster/monster.types'

export type PowerTier = 1 | 2 | 3

/** A animação é um dado, não um componente: `<PowerEffect kind={power.animation} />`. */
export type AnimationKind =
  | 'slash'
  | 'wave'
  | 'bubble'
  | 'ember'
  | 'blaze'
  | 'leaf'
  | 'bloom'
  | 'rock'
  | 'quake'
  | 'spark'
  | 'bolt'

export type Power = {
  id: string
  name: string
  element: Element
  tier: PowerTier
  minLevel: number
  multiplier: number
  animation: AnimationKind
}

export const TIER_MIN_LEVEL: Record<PowerTier, number> = { 1: 1, 2: 5, 3: 8 }

export const POWERS: Power[] = [
  { id: 'agua-1', name: 'Jato', element: 'agua', tier: 1, minLevel: 1, multiplier: 1, animation: 'bubble' },
  { id: 'agua-2', name: 'Maré', element: 'agua', tier: 2, minLevel: 5, multiplier: 1.2, animation: 'wave' },
  { id: 'agua-3', name: 'Maremoto', element: 'agua', tier: 3, minLevel: 8, multiplier: 1.45, animation: 'wave' },

  { id: 'fogo-1', name: 'Brasa', element: 'fogo', tier: 1, minLevel: 1, multiplier: 1, animation: 'ember' },
  { id: 'fogo-2', name: 'Labareda', element: 'fogo', tier: 2, minLevel: 5, multiplier: 1.2, animation: 'blaze' },
  { id: 'fogo-3', name: 'Inferno', element: 'fogo', tier: 3, minLevel: 8, multiplier: 1.45, animation: 'blaze' },

  { id: 'planta-1', name: 'Chicote', element: 'planta', tier: 1, minLevel: 1, multiplier: 1, animation: 'leaf' },
  { id: 'planta-2', name: 'Espinhos', element: 'planta', tier: 2, minLevel: 5, multiplier: 1.2, animation: 'slash' },
  { id: 'planta-3', name: 'Floração', element: 'planta', tier: 3, minLevel: 8, multiplier: 1.45, animation: 'bloom' },

  { id: 'terra-1', name: 'Pedrada', element: 'terra', tier: 1, minLevel: 1, multiplier: 1, animation: 'rock' },
  { id: 'terra-2', name: 'Fissura', element: 'terra', tier: 2, minLevel: 5, multiplier: 1.2, animation: 'quake' },
  { id: 'terra-3', name: 'Cataclisma', element: 'terra', tier: 3, minLevel: 8, multiplier: 1.45, animation: 'quake' },

  { id: 'eletrico-1', name: 'Faísca', element: 'eletrico', tier: 1, minLevel: 1, multiplier: 1, animation: 'spark' },
  { id: 'eletrico-2', name: 'Descarga', element: 'eletrico', tier: 2, minLevel: 5, multiplier: 1.2, animation: 'bolt' },
  { id: 'eletrico-3', name: 'Tempestade', element: 'eletrico', tier: 3, minLevel: 8, multiplier: 1.45, animation: 'bolt' },
]

export const POWERS_BY_ELEMENT = Object.fromEntries(
  ELEMENT_CYCLE.map((element) => [
    element,
    POWERS.filter((power) => power.element === element).sort((a, b) => a.tier - b.tier),
  ]),
) as Record<Element, Power[]>
