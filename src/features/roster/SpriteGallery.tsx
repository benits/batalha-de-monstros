import { useMemo } from 'react'
import type { Element } from '@/domain/monster/monster.types'
import { generateSpriteDataUri } from '@/lib/sprite/generateSprite'
import { SPRITE_PRESETS, presetUrl } from '@/lib/sprite/presets'
import { cn } from '@/lib/cn'

const VARIANT_COUNT = 6

type Option = { key: string; url: string; label: string }

type SpriteGalleryProps = {
  seed: string
  element: Element
  value: string
  onPick: (url: string) => void
}

/**
 * Duas origens de sprite, na mesma grade: os presets CC0 que acompanham o app
 * (filtrados pelo elemento escolhido) e variações procedurais do nome atual.
 * Clicar preenche `image_url` — nenhuma das duas depende de rede externa.
 */
export const SpriteGallery = ({ seed, element, value, onPick }: SpriteGalleryProps) => {
  const presets: Option[] = useMemo(
    () =>
      SPRITE_PRESETS[element].map((preset) => ({
        key: preset.file,
        url: presetUrl(preset.file),
        label: preset.label,
      })),
    [element],
  )

  const variants: Option[] = useMemo(
    () =>
      Array.from({ length: VARIANT_COUNT }, (_, index) => ({
        key: `variant-${index}`,
        url: generateSpriteDataUri(`${seed || '?'}#${index}`, element),
        label: `Variação ${index + 1}`,
      })),
    [seed, element],
  )

  const renderRow = (title: string, options: Option[]) => (
    <div className="flex flex-col gap-1.5">
      <span className="text-dim text-[10px] tracking-[0.2em] uppercase">{title}</span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => onPick(option.url)}
            title={option.label}
            aria-label={option.label}
            aria-pressed={value === option.url}
            className={cn(
              'bg-void pixel-border-lo grid size-10 cursor-pointer place-items-center',
              value === option.url && 'pixel-border-amber',
            )}
          >
            <img src={option.url} alt="" className="pixelated size-8 object-contain" />
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div className="flex flex-col gap-3">
      {renderRow('Sprites do elemento', presets)}
      {renderRow('Ou gere a partir do nome', variants)}
    </div>
  )
}
