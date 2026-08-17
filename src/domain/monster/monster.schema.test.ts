import { describe, expect, it } from 'vitest'
import { monsterDraftSchema } from './monster.schema'

const valid = {
  name: 'Golem',
  attack: 30,
  defense: 20,
  speed: 15,
  hp: 100,
  imageUrl: '',
  element: 'terra',
}

describe('monsterDraftSchema', () => {
  it('aceita um monstro válido', () => {
    expect(monsterDraftSchema.safeParse(valid).success).toBe(true)
  })

  it('rejeita nome vazio', () => {
    expect(monsterDraftSchema.safeParse({ ...valid, name: '  ' }).success).toBe(false)
  })

  it('remove espaços das pontas do nome', () => {
    expect(monsterDraftSchema.parse({ ...valid, name: '  Golem  ' }).name).toBe('Golem')
  })

  it('rejeita atributo zero ou negativo', () => {
    expect(monsterDraftSchema.safeParse({ ...valid, attack: 0 }).success).toBe(false)
    expect(monsterDraftSchema.safeParse({ ...valid, hp: -1 }).success).toBe(false)
  })

  it('rejeita atributo fracionário', () => {
    expect(monsterDraftSchema.safeParse({ ...valid, speed: 1.5 }).success).toBe(false)
  })

  it('aceita image_url vazia', () => {
    expect(monsterDraftSchema.safeParse({ ...valid, imageUrl: '' }).success).toBe(true)
  })

  it('rejeita image_url que não é URL', () => {
    expect(monsterDraftSchema.safeParse({ ...valid, imageUrl: 'nao-e-url' }).success).toBe(false)
  })

  it('rejeita elemento desconhecido', () => {
    expect(monsterDraftSchema.safeParse({ ...valid, element: 'vento' }).success).toBe(false)
  })
})
