import type { Monster } from '@/domain/monster/monster.types'

export type TurnOrder = {
  first: Monster
  second: Monster
  /** Por que este monstro começa — a UI mostra isso na tela de seleção. */
  reason: 'speed' | 'attack'
}

/**
 * Regra do enunciado: ataca primeiro quem tem maior velocidade;
 * velocidades iguais resolvem pelo maior ataque.
 */
export const resolveFirstAttacker = (a: Monster, b: Monster): TurnOrder => {
  if (a.speed !== b.speed) {
    return a.speed > b.speed
      ? { first: a, second: b, reason: 'speed' }
      : { first: b, second: a, reason: 'speed' }
  }
  return a.attack >= b.attack
    ? { first: a, second: b, reason: 'attack' }
    : { first: b, second: a, reason: 'attack' }
}
