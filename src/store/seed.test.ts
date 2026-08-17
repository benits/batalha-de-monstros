import { describe, expect, it } from 'vitest'
import { SEED_MONSTERS } from './seed'
import { levelOf } from '@/domain/monster/monster.rules'
import { unlockedPowers } from '@/domain/powers/powers.rules'
import { monsterDraftSchema } from '@/domain/monster/monster.schema'
import { ELEMENT_CYCLE } from '@/domain/monster/monster.types'

describe('SEED_MONSTERS', () => {
  it('passa na mesma validação exigida do usuário', () => {
    for (const monster of SEED_MONSTERS) {
      expect(monsterDraftSchema.safeParse(monster).success).toBe(true)
    }
  })

  it('tem ids únicos', () => {
    const ids = SEED_MONSTERS.map((monster) => monster.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('cobre todos os elementos do ciclo', () => {
    const used = new Set(SEED_MONSTERS.map((monster) => monster.element))
    for (const element of ELEMENT_CYCLE) expect(used.has(element)).toBe(true)
  })

  it('mistura sprite CC0 e sprite procedural, para as duas camadas ficarem visíveis', () => {
    const comUrl = SEED_MONSTERS.filter((monster) => monster.imageUrl !== '')
    const semUrl = SEED_MONSTERS.filter((monster) => monster.imageUrl === '')
    expect(comUrl.length).toBeGreaterThan(0)
    expect(semUrl.length).toBeGreaterThan(0)
  })

  it('cobre os três tiers de poder, para o modo arena não ficar sempre no tier 1', () => {
    const unlockCounts = SEED_MONSTERS.map(
      (monster) => unlockedPowers(monster.element, levelOf(monster)).length,
    )
    expect(new Set(unlockCounts)).toEqual(new Set([1, 2, 3]))
  })
})
