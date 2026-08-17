import { describe, expect, it } from 'vitest'
import { clamp, levelOf, powerScore } from './monster.rules'
import type { Monster } from './monster.types'

const monster = (over: Partial<Monster> = {}): Monster => ({
  id: 'm1',
  name: 'Teste',
  attack: 10,
  defense: 10,
  speed: 10,
  hp: 10,
  imageUrl: '',
  element: 'fogo',
  ...over,
})

describe('clamp', () => {
  it('mantém o valor dentro dos limites', () => {
    expect(clamp(5, 1, 10)).toBe(5)
    expect(clamp(0, 1, 10)).toBe(1)
    expect(clamp(99, 1, 10)).toBe(10)
  })
})

describe('powerScore', () => {
  it('soma os quatro atributos', () => {
    expect(powerScore(monster())).toBe(40)
  })
})

describe('levelOf', () => {
  it('é 1 no mínimo, mesmo com atributos baixos', () => {
    expect(levelOf(monster({ attack: 1, defense: 1, speed: 1, hp: 1 }))).toBe(1)
  })

  it('sobe a cada 24 pontos de atributo somados', () => {
    // 40 + 40 + 20 + 20 = 120 → nível 5
    expect(levelOf(monster({ attack: 40, defense: 40, speed: 20, hp: 20 }))).toBe(5)
  })

  it('é 10 no máximo', () => {
    expect(levelOf(monster({ attack: 200, defense: 200, speed: 200, hp: 200 }))).toBe(10)
  })
})
