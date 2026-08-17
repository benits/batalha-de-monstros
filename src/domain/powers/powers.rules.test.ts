import { describe, expect, it } from 'vitest'
import { POWERS, POWERS_BY_ELEMENT, TIER_MIN_LEVEL } from './powers.catalog'
import { powerForRound, unlockedPowers } from './powers.rules'
import { ELEMENT_CYCLE } from '@/domain/monster/monster.types'

describe('POWERS', () => {
  it('tem exatamente três poderes por elemento', () => {
    for (const element of ELEMENT_CYCLE) {
      expect(POWERS_BY_ELEMENT[element]).toHaveLength(3)
    }
  })

  it('tem ids únicos', () => {
    const ids = POWERS.map((power) => power.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('ordena os tiers por nível mínimo crescente', () => {
    for (const element of ELEMENT_CYCLE) {
      const levels = POWERS_BY_ELEMENT[element].map((power) => power.minLevel)
      expect(levels).toEqual([TIER_MIN_LEVEL[1], TIER_MIN_LEVEL[2], TIER_MIN_LEVEL[3]])
    }
  })
})

describe('unlockedPowers', () => {
  it('libera só o tier 1 no nível 1', () => {
    expect(unlockedPowers('fogo', 1)).toHaveLength(1)
  })

  it('libera dois poderes no nível 5', () => {
    expect(unlockedPowers('fogo', 5)).toHaveLength(2)
  })

  it('libera os três no nível 8', () => {
    expect(unlockedPowers('fogo', 8)).toHaveLength(3)
  })
})

describe('powerForRound', () => {
  it('cicla pelos poderes destravados, sem aleatoriedade', () => {
    const first = powerForRound('fogo', 8, 0)
    const fourth = powerForRound('fogo', 8, 3)
    expect(first.id).toBe(fourth.id)
    expect(powerForRound('fogo', 8, 1).id).not.toBe(first.id)
  })

  it('é determinístico para a mesma entrada', () => {
    expect(powerForRound('agua', 5, 7).id).toBe(powerForRound('agua', 5, 7).id)
  })
})
