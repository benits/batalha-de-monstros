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

  it('aceita url absoluta', () => {
    const url = 'https://exemplo.com/monstro.png'
    expect(monsterDraftSchema.safeParse({ ...valid, imageUrl: url }).success).toBe(true)
  })

  it('aceita caminho relativo dos sprites que acompanham o app', () => {
    expect(monsterDraftSchema.safeParse({ ...valid, imageUrl: '/sprites/agua-kraken.png' }).success).toBe(
      true,
    )
  })

  it('aceita data uri, que é o que o sprite procedural produz', () => {
    const dataUri = 'data:image/svg+xml,%3Csvg%3E%3C/svg%3E'
    expect(monsterDraftSchema.safeParse({ ...valid, imageUrl: dataUri }).success).toBe(true)
  })

  it('rejeita texto que não é imagem nenhuma', () => {
    expect(monsterDraftSchema.safeParse({ ...valid, imageUrl: 'nao-e-url' }).success).toBe(false)
  })

  it('rejeita caminho relativo sem extensão de imagem', () => {
    expect(monsterDraftSchema.safeParse({ ...valid, imageUrl: '/sprites/qualquer' }).success).toBe(
      false,
    )
  })

  it('rejeita elemento desconhecido', () => {
    expect(monsterDraftSchema.safeParse({ ...valid, element: 'vento' }).success).toBe(false)
  })
})
