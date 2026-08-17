import { describe, expect, it } from 'vitest'
import { safeMonsters } from './hydrate'
import { SEED_MONSTERS } from './seed'

const valid = SEED_MONSTERS[0]

describe('safeMonsters', () => {
  it('mantém monstros válidos', () => {
    expect(safeMonsters({ monsters: [valid] })).toEqual([valid])
  })

  it('cai no roster inicial quando o estado salvo não é objeto', () => {
    expect(safeMonsters(null)).toEqual(SEED_MONSTERS)
    expect(safeMonsters('lixo')).toEqual(SEED_MONSTERS)
    expect(safeMonsters(42)).toEqual(SEED_MONSTERS)
  })

  it('cai no roster inicial quando monsters não é array', () => {
    expect(safeMonsters({ monsters: 'nao-e-array' })).toEqual(SEED_MONSTERS)
    expect(safeMonsters({})).toEqual(SEED_MONSTERS)
  })

  it('descarta apenas os itens corrompidos, preservando os bons', () => {
    const result = safeMonsters({
      monsters: [valid, { id: 'x', name: '' }, { nada: true }, SEED_MONSTERS[1]],
    })
    expect(result).toEqual([valid, SEED_MONSTERS[1]])
  })

  it('respeita roster legitimamente vazio, sem re-semear', () => {
    expect(safeMonsters({ monsters: [] })).toEqual([])
  })

  it('descarta monstro com atributo fora da faixa', () => {
    expect(safeMonsters({ monsters: [{ ...valid, attack: 9999 }] })).toEqual([])
  })
})
