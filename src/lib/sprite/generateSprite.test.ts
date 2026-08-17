import { describe, expect, it } from 'vitest'
import { generateSpriteDataUri, generateSpriteSvg } from './generateSprite'

describe('generateSpriteSvg', () => {
  it('devolve um SVG', () => {
    const svg = generateSpriteSvg('Golem', 'terra')
    expect(svg.startsWith('<svg')).toBe(true)
    expect(svg.endsWith('</svg>')).toBe(true)
  })

  it('é determinístico para a mesma seed e elemento', () => {
    expect(generateSpriteSvg('Golem', 'terra')).toBe(generateSpriteSvg('Golem', 'terra'))
  })

  it('muda quando a seed muda', () => {
    expect(generateSpriteSvg('Golem', 'terra')).not.toBe(generateSpriteSvg('Slime', 'terra'))
  })

  it('muda quando o elemento muda', () => {
    expect(generateSpriteSvg('Golem', 'terra')).not.toBe(generateSpriteSvg('Golem', 'agua'))
  })

  it('não quebra com seed vazia', () => {
    expect(() => generateSpriteSvg('', 'fogo')).not.toThrow()
  })
})

describe('generateSpriteDataUri', () => {
  it('devolve um data URI de SVG', () => {
    expect(generateSpriteDataUri('Golem', 'terra')).toMatch(/^data:image\/svg\+xml,/)
  })
})
