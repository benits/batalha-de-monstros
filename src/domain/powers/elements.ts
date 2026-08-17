import { ELEMENT_CYCLE, type Element } from '@/domain/monster/monster.types'

export type ElementMeta = {
  label: string
  /** Cor base do elemento: paleta do sprite, badge e cor do efeito visual. */
  color: string
  glyph: string
}

/**
 * Fonte única de verdade sobre elementos. Alimenta sprite, badge,
 * catálogo de poderes e efeitos — adicionar um elemento é editar aqui.
 */
export const ELEMENTS: Record<Element, ElementMeta> = {
  agua: { label: 'Água', color: '#45E0FF', glyph: '≈' },
  fogo: { label: 'Fogo', color: '#FF6B3D', glyph: '▲' },
  planta: { label: 'Planta', color: '#7CF03D', glyph: '✦' },
  terra: { label: 'Terra', color: '#B5793C', glyph: '◆' },
  eletrico: { label: 'Elétrico', color: '#FFE23D', glyph: '⚡' },
}

export const STRONG_MULTIPLIER = 1.5
export const WEAK_MULTIPLIER = 0.75
export const NEUTRAL_MULTIPLIER = 1

/**
 * Ciclo fechado: cada elemento é forte contra o seguinte e fraco contra o anterior.
 * Aritmética modular no lugar de uma matriz de matchup.
 */
export const advantage = (attacker: Element, defender: Element): number => {
  const size = ELEMENT_CYCLE.length
  const index = ELEMENT_CYCLE.indexOf(attacker)
  if (ELEMENT_CYCLE[(index + 1) % size] === defender) return STRONG_MULTIPLIER
  if (ELEMENT_CYCLE[(index + size - 1) % size] === defender) return WEAK_MULTIPLIER
  return NEUTRAL_MULTIPLIER
}
