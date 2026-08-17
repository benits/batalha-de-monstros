import { describe, expect, it } from 'vitest'
import { ELEMENTS, advantage } from './elements'
import { ELEMENT_CYCLE } from '@/domain/monster/monster.types'

describe('advantage', () => {
  it('dá 1.5 contra o próximo elemento do ciclo', () => {
    expect(advantage('agua', 'fogo')).toBe(1.5)
    expect(advantage('fogo', 'planta')).toBe(1.5)
    expect(advantage('planta', 'terra')).toBe(1.5)
    expect(advantage('terra', 'eletrico')).toBe(1.5)
    expect(advantage('eletrico', 'agua')).toBe(1.5)
  })

  it('dá 0.75 contra o elemento anterior do ciclo', () => {
    expect(advantage('fogo', 'agua')).toBe(0.75)
    expect(advantage('agua', 'eletrico')).toBe(0.75)
  })

  it('dá 1 para qualquer outro par, inclusive espelho', () => {
    expect(advantage('agua', 'planta')).toBe(1)
    expect(advantage('fogo', 'fogo')).toBe(1)
  })

  it('o ciclo é fechado: todo elemento vence exatamente um e perde para exatamente um', () => {
    for (const attacker of ELEMENT_CYCLE) {
      const wins = ELEMENT_CYCLE.filter((defender) => advantage(attacker, defender) === 1.5)
      const loses = ELEMENT_CYCLE.filter((defender) => advantage(attacker, defender) === 0.75)
      expect(wins).toHaveLength(1)
      expect(loses).toHaveLength(1)
    }
  })
})

describe('ELEMENTS', () => {
  it('tem metadados para todo elemento do ciclo', () => {
    for (const element of ELEMENT_CYCLE) {
      expect(ELEMENTS[element].label).toBeTruthy()
      expect(ELEMENTS[element].color).toMatch(/^#[0-9A-F]{6}$/i)
    }
  })
})
