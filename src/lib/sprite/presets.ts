import { ELEMENT_CYCLE, type Element } from '@/domain/monster/monster.types'

export type SpritePreset = {
  /** Nome do arquivo em `public/sprites/`. */
  file: string
  label: string
}

/**
 * Sprites CC0 do Dungeon Crawl Stone Soup, escolhidos por afinidade com cada
 * elemento. Ficam em `public/sprites/` — veja os créditos naquele diretório.
 */
export const SPRITE_PRESETS: Record<Element, SpritePreset[]> = {
  agua: [
    { file: 'agua-agua-viva.png', label: 'Água-viva' },
    { file: 'agua-kraken.png', label: 'Kraken' },
    { file: 'agua-octopode.png', label: 'Octópode' },
  ],
  fogo: [
    { file: 'fogo-elemental.png', label: 'Elemental de fogo' },
    { file: 'fogo-vortice.png', label: 'Vórtice ígneo' },
    { file: 'fogo-serpente-de-lava.png', label: 'Serpente de lava' },
  ],
  planta: [
    { file: 'planta-cogumelo.png', label: 'Cogumelo-da-morte' },
    { file: 'planta-lodo-acido.png', label: 'Lodo ácido' },
    { file: 'planta-espinheiro.png', label: 'Espinheiro' },
  ],
  terra: [
    { file: 'terra-elemental.png', label: 'Elemental de terra' },
    { file: 'terra-rocha.png', label: 'Rocha viva' },
    { file: 'terra-estatua-de-obsidiana.png', label: 'Estátua de obsidiana' },
  ],
  eletrico: [
    { file: 'eletrico-golem.png', label: 'Golem elétrico' },
    { file: 'eletrico-esfera.png', label: 'Esfera de raios' },
    { file: 'eletrico-enguia.png', label: 'Enguia elétrica' },
  ],
}

/** Respeita o `base` do Vite, para o app funcionar servido em subdiretório. */
export const presetUrl = (file: string): string => `${import.meta.env.BASE_URL}sprites/${file}`

export const ALL_PRESETS: SpritePreset[] = ELEMENT_CYCLE.flatMap(
  (element) => SPRITE_PRESETS[element],
)
