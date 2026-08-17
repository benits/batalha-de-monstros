import type { Monster } from '@/domain/monster/monster.types'
import type { Power } from '@/domain/powers/powers.catalog'

export type DamageMode = 'classic' | 'arena'

export type RoundContext = {
  /** Índice do turno do atacante, base 0. Usado para o rodízio de poderes. */
  turnIndex: number
  /**
   * Poder escolhido pelo jogador no modo por turno. Ignorado se não pertencer
   * ao elemento do atacante ou se o nível dele ainda não o destravou — a
   * escolha da UI nunca vira privilégio sobre a regra.
   */
  chosenPowerId?: string
}

export type DamageOutcome = {
  damage: number
  /** Multiplicador de vantagem elemental aplicado; 1 no modo clássico. */
  effectiveness: number
  power?: Power
}

export type DamageRule = (
  attacker: Monster,
  defender: Monster,
  context: RoundContext,
) => DamageOutcome

export type Round = {
  round: number
  attackerId: string
  defenderId: string
  damage: number
  effectiveness: number
  powerId?: string
  /** HP restante dos dois lados ao fim do round, na ordem em que a batalha foi criada. */
  hpA: number
  hpB: number
}

/** Batalha em andamento. `winnerId` definido significa encerrada. */
export type BattleState = {
  mode: DamageMode
  monsterAId: string
  monsterBId: string
  firstAttackerId: string
  firstAttackerReason: 'speed' | 'attack'
  attackerId: string
  defenderId: string
  hp: Record<string, number>
  turnsTaken: Record<string, number>
  rounds: Round[]
  winnerId?: string
  loserId?: string
}

export type BattleResult = {
  mode: DamageMode
  monsterAId: string
  monsterBId: string
  firstAttackerId: string
  firstAttackerReason: 'speed' | 'attack'
  winnerId: string
  loserId: string
  rounds: Round[]
}
