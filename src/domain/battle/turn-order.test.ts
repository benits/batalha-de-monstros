import { describe, expect, it } from 'vitest'
import { resolveFirstAttacker } from './turn-order'
import type { Monster } from '@/domain/monster/monster.types'

const monster = (id: string, speed: number, attack: number): Monster => ({
  id,
  name: id,
  attack,
  defense: 5,
  speed,
  hp: 50,
  imageUrl: '',
  element: 'fogo',
})

describe('resolveFirstAttacker', () => {
  it('escolhe o de maior velocidade', () => {
    const rapido = monster('rapido', 30, 10)
    const lento = monster('lento', 10, 99)
    expect(resolveFirstAttacker(lento, rapido).first.id).toBe('rapido')
    expect(resolveFirstAttacker(rapido, lento).first.id).toBe('rapido')
  })

  it('desempata velocidade igual pelo maior ataque', () => {
    const forte = monster('forte', 20, 40)
    const fraco = monster('fraco', 20, 10)
    expect(resolveFirstAttacker(fraco, forte).first.id).toBe('forte')
  })

  it('devolve o outro monstro como segundo', () => {
    const { first, second } = resolveFirstAttacker(monster('a', 30, 10), monster('b', 10, 10))
    expect(first.id).toBe('a')
    expect(second.id).toBe('b')
  })

  it('informa o motivo do desempate', () => {
    expect(resolveFirstAttacker(monster('a', 30, 10), monster('b', 10, 10)).reason).toBe('speed')
    expect(resolveFirstAttacker(monster('c', 20, 40), monster('d', 20, 10)).reason).toBe('attack')
  })
})
