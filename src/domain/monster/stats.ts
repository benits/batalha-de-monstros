import type { Monster } from './monster.types'
import { MAX_HP, MAX_STAT } from './monster.schema'

/** Os quatro atributos numéricos do enunciado, na ordem em que a UI os apresenta. */
export type StatKey = Extract<keyof Monster, 'attack' | 'defense' | 'speed' | 'hp'>

export const STAT_KEYS: StatKey[] = ['attack', 'defense', 'speed', 'hp']

export const STAT_LABEL: Record<StatKey, string> = {
  attack: 'ATK',
  defense: 'DEF',
  speed: 'VEL',
  hp: 'HP',
}

export const STAT_FULL_LABEL: Record<StatKey, string> = {
  attack: 'Ataque',
  defense: 'Defesa',
  speed: 'Velocidade',
  hp: 'HP',
}

/** Teto de cada atributo — o mesmo que o schema valida, para a barra não estourar. */
export const STAT_MAX: Record<StatKey, number> = {
  attack: MAX_STAT,
  defense: MAX_STAT,
  speed: MAX_STAT,
  hp: MAX_HP,
}
