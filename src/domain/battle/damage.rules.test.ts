import { describe, expect, it } from 'vitest'
import { arenaDamage, classicDamage } from './damage.rules'
import type { Monster } from '@/domain/monster/monster.types'

const monster = (over: Partial<Monster> = {}): Monster => ({
  id: 'm',
  name: 'm',
  attack: 30,
  defense: 10,
  speed: 10,
  hp: 100,
  imageUrl: '',
  element: 'fogo',
  ...over,
})

describe('classicDamage', () => {
  it('subtrai a defesa do ataque', () => {
    expect(
      classicDamage(monster({ attack: 30 }), monster({ defense: 12 }), { turnIndex: 0 }).damage,
    ).toBe(18)
  })

  it('dá dano 1 quando o ataque é menor que a defesa', () => {
    expect(
      classicDamage(monster({ attack: 5 }), monster({ defense: 40 }), { turnIndex: 0 }).damage,
    ).toBe(1)
  })

  it('dá dano 1 quando ataque e defesa são iguais', () => {
    expect(
      classicDamage(monster({ attack: 20 }), monster({ defense: 20 }), { turnIndex: 0 }).damage,
    ).toBe(1)
  })

  it('não usa poder nem multiplicador de elemento', () => {
    const outcome = classicDamage(monster(), monster({ element: 'planta' }), { turnIndex: 0 })
    expect(outcome.power).toBeUndefined()
    expect(outcome.effectiveness).toBe(1)
  })
})

describe('arenaDamage', () => {
  it('aplica a vantagem elemental sobre o dano clássico', () => {
    // fogo vence planta: base 20 × poder 1 × 1.5 = 30
    const outcome = arenaDamage(
      monster({ attack: 30, defense: 10, element: 'fogo' }),
      monster({ defense: 10, element: 'planta' }),
      { turnIndex: 0 },
    )
    expect(outcome.effectiveness).toBe(1.5)
    expect(outcome.damage).toBe(30)
  })

  it('nunca desce abaixo de 1, mesmo com desvantagem', () => {
    const outcome = arenaDamage(
      monster({ attack: 5, defense: 10, element: 'fogo' }),
      monster({ defense: 99, element: 'agua' }),
      { turnIndex: 0 },
    )
    expect(outcome.damage).toBe(1)
  })

  it('reporta qual poder foi usado', () => {
    expect(arenaDamage(monster(), monster(), { turnIndex: 0 }).power?.element).toBe('fogo')
  })

  it('devolve inteiro, nunca fração', () => {
    const outcome = arenaDamage(
      monster({ attack: 21, defense: 10, element: 'fogo' }),
      monster({ defense: 10, element: 'agua' }),
      { turnIndex: 0 },
    )
    expect(Number.isInteger(outcome.damage)).toBe(true)
  })
})
