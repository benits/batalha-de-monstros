import type { Monster } from '@/domain/monster/monster.types'
import { DAMAGE_RULES } from './damage.rules'
import { resolveFirstAttacker } from './turn-order'
import type { BattleResult, BattleState, DamageMode } from './battle.types'

/**
 * A batalha como máquina de estado: um round por chamada, sem loop embutido.
 *
 * Isso permite dois drivers sobre a mesma regra. O modo automático percorre
 * tudo de uma vez, como o enunciado exige. O modo por turno chama o mesmo
 * `advanceRound` a cada clique do jogador. Não existe uma segunda
 * implementação da regra de batalha para divergir.
 */
export const createBattle = (
  monsterA: Monster,
  monsterB: Monster,
  mode: DamageMode,
): BattleState => {
  const { first, second, reason } = resolveFirstAttacker(monsterA, monsterB)

  return {
    mode,
    monsterAId: monsterA.id,
    monsterBId: monsterB.id,
    firstAttackerId: first.id,
    firstAttackerReason: reason,
    attackerId: first.id,
    defenderId: second.id,
    hp: { [monsterA.id]: monsterA.hp, [monsterB.id]: monsterB.hp },
    turnsTaken: { [monsterA.id]: 0, [monsterB.id]: 0 },
    rounds: [],
  }
}

export const isFinished = (state: BattleState): boolean => state.winnerId !== undefined

/** Resolve um round e devolve um estado novo; o recebido não é tocado. */
export const advanceRound = (
  monsterA: Monster,
  monsterB: Monster,
  state: BattleState,
  chosenPowerId?: string,
): BattleState => {
  if (isFinished(state)) return state

  const byId: Record<string, Monster> = { [monsterA.id]: monsterA, [monsterB.id]: monsterB }
  const attacker = byId[state.attackerId]
  const defender = byId[state.defenderId]

  const outcome = DAMAGE_RULES[state.mode](attacker, defender, {
    turnIndex: state.turnsTaken[attacker.id],
    chosenPowerId,
  })

  const hp = {
    ...state.hp,
    [defender.id]: Math.max(0, state.hp[defender.id] - outcome.damage),
  }
  const defeated = hp[defender.id] === 0

  return {
    ...state,
    hp,
    turnsTaken: { ...state.turnsTaken, [attacker.id]: state.turnsTaken[attacker.id] + 1 },
    attackerId: defeated ? state.attackerId : state.defenderId,
    defenderId: defeated ? state.defenderId : state.attackerId,
    winnerId: defeated ? attacker.id : undefined,
    loserId: defeated ? defender.id : undefined,
    rounds: [
      ...state.rounds,
      {
        round: state.rounds.length + 1,
        attackerId: attacker.id,
        defenderId: defender.id,
        damage: outcome.damage,
        effectiveness: outcome.effectiveness,
        powerId: outcome.power?.id,
        hpA: hp[state.monsterAId],
        hpB: hp[state.monsterBId],
      },
    ],
  }
}

/** Converte um estado encerrado no resultado que a UI e o histórico consomem. */
export const toResult = (
  monsterA: Monster,
  monsterB: Monster,
  state: BattleState,
): BattleResult => {
  if (!state.winnerId || !state.loserId) {
    throw new Error('toResult exige uma batalha encerrada')
  }

  return {
    mode: state.mode,
    monsterAId: monsterA.id,
    monsterBId: monsterB.id,
    firstAttackerId: state.firstAttackerId,
    firstAttackerReason: state.firstAttackerReason,
    winnerId: state.winnerId,
    loserId: state.loserId,
    rounds: state.rounds,
  }
}
