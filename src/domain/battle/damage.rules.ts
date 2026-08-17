import type { Monster } from '@/domain/monster/monster.types'
import { levelOf } from '@/domain/monster/monster.rules'
import { advantage } from '@/domain/powers/elements'
import { powerForRound } from '@/domain/powers/powers.rules'
import type { DamageRule } from './battle.types'

export const MIN_DAMAGE = 1

/** `damage = attack - defense`, mínimo 1. A fórmula do enunciado, sem adição nenhuma. */
export const baseDamage = (attacker: Monster, defender: Monster): number =>
  Math.max(MIN_DAMAGE, attacker.attack - defender.defense)

/** Modo Clássico — o default da aplicação. */
export const classicDamage: DamageRule = (attacker, defender) => ({
  damage: baseDamage(attacker, defender),
  effectiveness: 1,
})

/** Modo Arena — poder do round e vantagem elemental sobre o dano clássico. */
export const arenaDamage: DamageRule = (attacker, defender, context) => {
  const power = powerForRound(attacker.element, levelOf(attacker), context.turnIndex)
  const effectiveness = advantage(attacker.element, defender.element)
  const raw = baseDamage(attacker, defender) * power.multiplier * effectiveness

  return {
    damage: Math.max(MIN_DAMAGE, Math.floor(raw)),
    effectiveness,
    power,
  }
}

export const DAMAGE_RULES: Record<'classic' | 'arena', DamageRule> = {
  classic: classicDamage,
  arena: arenaDamage,
}
