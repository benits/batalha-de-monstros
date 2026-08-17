import { describe, expect, it } from 'vitest'
import { simulateBattle } from './battle.engine'
import type { Monster } from '@/domain/monster/monster.types'

const monster = (over: Partial<Monster> & { id: string }): Monster => ({
  name: over.id,
  attack: 20,
  defense: 10,
  speed: 10,
  hp: 50,
  imageUrl: '',
  element: 'fogo',
  ...over,
})

describe('simulateBattle — modo clássico', () => {
  it('quem tem mais velocidade ataca primeiro', () => {
    const result = simulateBattle(monster({ id: 'a', speed: 5 }), monster({ id: 'b', speed: 50 }))
    expect(result.firstAttackerId).toBe('b')
    expect(result.rounds[0].attackerId).toBe('b')
  })

  it('empate de velocidade resolve pelo maior ataque', () => {
    const result = simulateBattle(
      monster({ id: 'a', speed: 10, attack: 15 }),
      monster({ id: 'b', speed: 10, attack: 40 }),
    )
    expect(result.firstAttackerId).toBe('b')
    expect(result.firstAttackerReason).toBe('attack')
  })

  it('alterna os atacantes a cada round', () => {
    const result = simulateBattle(monster({ id: 'a', speed: 50 }), monster({ id: 'b', speed: 10 }))
    expect(result.rounds[0].attackerId).toBe('a')
    expect(result.rounds[1].attackerId).toBe('b')
    expect(result.rounds[2].attackerId).toBe('a')
  })

  it('vence quem zera o hp do inimigo primeiro', () => {
    const result = simulateBattle(
      monster({ id: 'a', speed: 50, attack: 100, defense: 0, hp: 30 }),
      monster({ id: 'b', speed: 1, attack: 5, defense: 0, hp: 10 }),
    )
    expect(result.winnerId).toBe('a')
    expect(result.loserId).toBe('b')
    expect(result.rounds).toHaveLength(1)
  })

  it('o hp nunca fica negativo', () => {
    const result = simulateBattle(
      monster({ id: 'a', speed: 50, attack: 999, defense: 0, hp: 100 }),
      monster({ id: 'b', speed: 1, hp: 10 }),
    )
    expect(result.rounds.at(-1)!.hpB).toBe(0)
  })

  it('termina mesmo quando os dois lados só causam dano 1', () => {
    const result = simulateBattle(
      monster({ id: 'a', speed: 50, attack: 1, defense: 99, hp: 5 }),
      monster({ id: 'b', speed: 1, attack: 1, defense: 99, hp: 5 }),
    )
    expect(result.rounds.every((round) => round.damage === 1)).toBe(true)
    expect(result.winnerId).toBe('a')
  })

  it('numera os rounds a partir de 1, sem furo', () => {
    const result = simulateBattle(
      monster({ id: 'a', speed: 50, hp: 60 }),
      monster({ id: 'b', speed: 1, hp: 60 }),
    )
    expect(result.rounds.map((round) => round.round)).toEqual(
      result.rounds.map((_, index) => index + 1),
    )
  })

  it('é determinístico', () => {
    const a = monster({ id: 'a', speed: 30, hp: 77 })
    const b = monster({ id: 'b', speed: 12, hp: 83 })
    expect(simulateBattle(a, b)).toEqual(simulateBattle(a, b))
  })

  it('registra o hp dos dois lados em cada round', () => {
    const result = simulateBattle(
      monster({ id: 'a', speed: 50, attack: 30, defense: 10, hp: 50 }),
      monster({ id: 'b', speed: 10, attack: 30, defense: 10, hp: 50 }),
    )
    expect(result.rounds[0]).toMatchObject({ hpA: 50, hpB: 30 })
    expect(result.rounds[1]).toMatchObject({ hpA: 30, hpB: 30 })
  })

  it('não aplica multiplicador de elemento', () => {
    const result = simulateBattle(
      monster({ id: 'a', speed: 50, element: 'fogo' }),
      monster({ id: 'b', speed: 10, element: 'planta' }),
    )
    expect(result.rounds.every((round) => round.effectiveness === 1)).toBe(true)
  })
})

describe('simulateBattle — modo arena', () => {
  it('aplica vantagem elemental quando o modo é arena', () => {
    const result = simulateBattle(
      monster({ id: 'a', speed: 50, element: 'fogo', attack: 30, defense: 10 }),
      monster({ id: 'b', speed: 10, element: 'planta', defense: 10 }),
      'arena',
    )
    expect(result.rounds[0].effectiveness).toBe(1.5)
    expect(result.rounds[0].powerId).toBeDefined()
  })

  it('guarda o modo usado no resultado', () => {
    const a = monster({ id: 'a', speed: 50 })
    const b = monster({ id: 'b', speed: 10 })
    expect(simulateBattle(a, b).mode).toBe('classic')
    expect(simulateBattle(a, b, 'arena').mode).toBe('arena')
  })
})
