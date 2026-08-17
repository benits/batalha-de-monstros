import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { ALL_PRESETS, SPRITE_PRESETS, presetUrl } from './presets'
import { ELEMENT_CYCLE } from '@/domain/monster/monster.types'
import { monsterDraftSchema } from '@/domain/monster/monster.schema'

const publicPath = (file: string) =>
  fileURLToPath(new URL(`../../../public/sprites/${file}`, import.meta.url))

describe('SPRITE_PRESETS', () => {
  it('tem presets para todo elemento do ciclo', () => {
    for (const element of ELEMENT_CYCLE) {
      expect(SPRITE_PRESETS[element].length).toBeGreaterThan(0)
    }
  })

  it('não repete arquivo entre elementos', () => {
    const files = ALL_PRESETS.map((preset) => preset.file)
    expect(new Set(files).size).toBe(files.length)
  })

  it('aponta para arquivos que existem em public/sprites', () => {
    const missing = ALL_PRESETS.filter((preset) => !existsSync(publicPath(preset.file)))
    expect(missing.map((preset) => preset.file)).toEqual([])
  })

  it('nomeia cada arquivo com o prefixo do elemento a que pertence', () => {
    for (const element of ELEMENT_CYCLE) {
      for (const preset of SPRITE_PRESETS[element]) {
        expect(preset.file.startsWith(`${element}-`)).toBe(true)
      }
    }
  })

  it('gera url que o schema do cadastro aceita', () => {
    for (const preset of ALL_PRESETS) {
      const result = monsterDraftSchema.shape.imageUrl.safeParse(presetUrl(preset.file))
      expect(result.success).toBe(true)
    }
  })
})
