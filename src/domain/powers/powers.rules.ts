import type { Element } from '@/domain/monster/monster.types'
import { POWERS_BY_ELEMENT, type Power } from './powers.catalog'

/** Poderes que o nível do monstro já liberou, do tier mais baixo ao mais alto. */
export const unlockedPowers = (element: Element, level: number): Power[] =>
  POWERS_BY_ELEMENT[element].filter((power) => level >= power.minLevel)

/**
 * Escolhe o poder do round percorrendo os destravados em rodízio.
 * Sem aleatoriedade: a mesma batalha sempre produz o mesmo resultado,
 * que é o que a exigência de calcular tudo de uma vez pressupõe.
 */
export const powerForRound = (element: Element, level: number, turnIndex: number): Power => {
  const available = unlockedPowers(element, level)
  return available[turnIndex % available.length]
}
