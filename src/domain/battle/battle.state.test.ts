import { describe, expect, it } from 'vitest'
import { advanceRound, createBattle, isFinished, toResult } from './battle.state'
import { simulateBattle } from './battle.engine'
import { unlockedPowers } from '@/domain/powers/powers.rules'
import { levelOf } from '@/domain/monster/monster.rules'
import type { Monster } from '@/domain/monster/monster.types'

const monster = (over: Partial<Monster> & { id: string }): Monster => ({
  name: over.id,
  attack: 30,
  defense: 10,
  speed: 10,
  hp: 100,
  imageUrl: '',
  element: 'fogo',
  ...over,
})

const a = monster({ id: 'a', speed: 40 })
const b = monster({ id: 'b', speed: 10 })

describe('createBattle', () => {
  it('começa com o hp cheio dos dois e nenhum round', () => {
    const state = createBattle(a, b, 'classic')
    expect(state.hp).toEqual({ a: 100, b: 100 })
    expect(state.rounds).toEqual([])
    expect(isFinished(state)).toBe(false)
  })

  it('define o primeiro atacante pela regra de ordem', () => {
    expect(createBattle(a, b, 'classic').attackerId).toBe('a')
    expect(createBattle(b, a, 'classic').attackerId).toBe('a')
  })
})

describe('advanceRound', () => {
  it('resolve um round por chamada e alterna o atacante', () => {
    let state = createBattle(a, b, 'classic')

    state = advanceRound(a, b, state)
    expect(state.rounds).toHaveLength(1)
    expect(state.rounds[0].attackerId).toBe('a')
    expect(state.attackerId).toBe('b')

    state = advanceRound(a, b, state)
    expect(state.rounds).toHaveLength(2)
    expect(state.rounds[1].attackerId).toBe('b')
  })

  it('não muda o estado recebido', () => {
    const state = createBattle(a, b, 'classic')
    const snapshot = structuredClone(state)
    advanceRound(a, b, state)
    expect(state).toEqual(snapshot)
  })

  it('marca a batalha como encerrada quando um hp zera', () => {
    const forte = monster({ id: 'forte', speed: 50, attack: 999, defense: 0 })
    const fraco = monster({ id: 'fraco', speed: 1, hp: 10 })

    const state = advanceRound(forte, fraco, createBattle(forte, fraco, 'classic'))
    expect(isFinished(state)).toBe(true)
    expect(state.winnerId).toBe('forte')
    expect(state.loserId).toBe('fraco')
  })

  it('ignora chamadas depois do fim', () => {
    const forte = monster({ id: 'forte', speed: 50, attack: 999, defense: 0 })
    const fraco = monster({ id: 'fraco', speed: 1, hp: 10 })

    const finished = advanceRound(forte, fraco, createBattle(forte, fraco, 'classic'))
    expect(advanceRound(forte, fraco, finished)).toEqual(finished)
  })
})

describe('poder escolhido', () => {
  const veterano = monster({ id: 'veterano', speed: 50, attack: 60, defense: 30, hp: 300 })
  const alvo = monster({ id: 'alvo', speed: 1, hp: 300, element: 'agua' })

  it('usa o poder informado em vez do rodízio automático', () => {
    const powers = unlockedPowers(veterano.element, levelOf(veterano))
    expect(powers.length).toBeGreaterThan(1)

    const escolhido = powers[powers.length - 1]
    const state = advanceRound(veterano, alvo, createBattle(veterano, alvo, 'arena'), escolhido.id)

    expect(state.rounds[0].powerId).toBe(escolhido.id)
  })

  it('ignora poder que o monstro não destravou', () => {
    const novato = monster({ id: 'novato', speed: 50, attack: 20, defense: 5, hp: 30 })
    const state = advanceRound(novato, alvo, createBattle(novato, alvo, 'arena'), 'fogo-3')

    const disponiveis = unlockedPowers(novato.element, levelOf(novato)).map((p) => p.id)
    expect(disponiveis).not.toContain('fogo-3')
    expect(state.rounds[0].powerId).not.toBe('fogo-3')
    expect(disponiveis).toContain(state.rounds[0].powerId)
  })

  it('ignora poder de outro elemento', () => {
    const state = advanceRound(veterano, alvo, createBattle(veterano, alvo, 'arena'), 'agua-1')
    expect(state.rounds[0].powerId).not.toBe('agua-1')
  })

  it('no modo clássico o poder escolhido não altera o dano', () => {
    const semEscolha = advanceRound(veterano, alvo, createBattle(veterano, alvo, 'classic'))
    const comEscolha = advanceRound(
      veterano,
      alvo,
      createBattle(veterano, alvo, 'classic'),
      'fogo-3',
    )
    expect(comEscolha.rounds[0].damage).toBe(semEscolha.rounds[0].damage)
    expect(comEscolha.rounds[0].powerId).toBeUndefined()
  })
})

describe('toResult', () => {
  it('reproduz exatamente o que simulateBattle devolve', () => {
    let state = createBattle(a, b, 'arena')
    while (!isFinished(state)) state = advanceRound(a, b, state)

    expect(toResult(a, b, state)).toEqual(simulateBattle(a, b, 'arena'))
  })
})
