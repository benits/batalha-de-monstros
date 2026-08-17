import type { Monster } from '@/domain/monster/monster.types'
import { advanceRound, createBattle, isFinished, toResult } from './battle.state'
import type { BattleResult, DamageMode } from './battle.types'

/**
 * Calcula a batalha inteira de uma vez, como o enunciado exige, e devolve
 * o array completo de rounds. A UI apenas reproduz esse array — nada é
 * decidido durante a animação.
 *
 * É um fold sobre `advanceRound`, o mesmo resolvedor que o modo por turno usa.
 * Uma regra, dois drivers.
 *
 * Função pura: mesma entrada, mesma saída, sem IO e sem aleatoriedade.
 */
export const simulateBattle = (
  monsterA: Monster,
  monsterB: Monster,
  mode: DamageMode = 'classic',
): BattleResult => {
  let state = createBattle(monsterA, monsterB, mode)

  while (!isFinished(state)) {
    state = advanceRound(monsterA, monsterB, state)
  }

  return toResult(monsterA, monsterB, state)
}
