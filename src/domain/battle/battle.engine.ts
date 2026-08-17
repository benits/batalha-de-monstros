import type { Monster } from '@/domain/monster/monster.types'
import { DAMAGE_RULES } from './damage.rules'
import { resolveFirstAttacker } from './turn-order'
import type { BattleResult, DamageMode, Round } from './battle.types'

/**
 * Calcula a batalha inteira de uma vez, como o enunciado exige, e devolve
 * o array completo de rounds. A UI apenas reproduz esse array — nada é
 * decidido durante a animação.
 *
 * Função pura: mesma entrada, mesma saída, sem IO e sem aleatoriedade.
 */
export const simulateBattle = (
  monsterA: Monster,
  monsterB: Monster,
  mode: DamageMode = 'classic',
): BattleResult => {
  const damageRule = DAMAGE_RULES[mode]
  const { first, second, reason } = resolveFirstAttacker(monsterA, monsterB)

  const hp: Record<string, number> = {
    [monsterA.id]: monsterA.hp,
    [monsterB.id]: monsterB.hp,
  }
  const turnsTaken: Record<string, number> = { [monsterA.id]: 0, [monsterB.id]: 0 }

  const rounds: Round[] = []
  let attacker = first
  let defender = second

  while (hp[monsterA.id] > 0 && hp[monsterB.id] > 0) {
    const outcome = damageRule(attacker, defender, { turnIndex: turnsTaken[attacker.id] })
    turnsTaken[attacker.id] += 1
    hp[defender.id] = Math.max(0, hp[defender.id] - outcome.damage)

    rounds.push({
      round: rounds.length + 1,
      attackerId: attacker.id,
      defenderId: defender.id,
      damage: outcome.damage,
      effectiveness: outcome.effectiveness,
      powerId: outcome.power?.id,
      hpA: hp[monsterA.id],
      hpB: hp[monsterB.id],
    })

    if (hp[defender.id] === 0) break

    const previousAttacker = attacker
    attacker = defender
    defender = previousAttacker
  }

  return {
    mode,
    monsterAId: monsterA.id,
    monsterBId: monsterB.id,
    firstAttackerId: first.id,
    firstAttackerReason: reason,
    winnerId: attacker.id,
    loserId: defender.id,
    rounds,
  }
}
