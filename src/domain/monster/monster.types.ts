export const ELEMENT_CYCLE = ['agua', 'fogo', 'planta', 'terra', 'eletrico'] as const

export type Element = (typeof ELEMENT_CYCLE)[number]

/** Os seis campos do enunciado, mais `element` (extensão documentada no README). */
export type Monster = {
  id: string
  name: string
  attack: number
  defense: number
  speed: number
  hp: number
  imageUrl: string
  element: Element
}

export type MonsterDraft = Omit<Monster, 'id'>
