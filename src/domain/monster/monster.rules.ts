import type { Monster } from './monster.types'

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max)

/** Soma dos quatro atributos numéricos. Base do nível e do ranking do roster. */
export const powerScore = (monster: Monster): number =>
  monster.attack + monster.defense + monster.speed + monster.hp

export const MAX_LEVEL = 10
export const POINTS_PER_LEVEL = 24

/**
 * O nível é derivado dos atributos, nunca cadastrado — assim o formulário
 * mantém exatamente os campos que o enunciado pede.
 */
export const levelOf = (monster: Monster): number =>
  clamp(Math.floor(powerScore(monster) / POINTS_PER_LEVEL), 1, MAX_LEVEL)
