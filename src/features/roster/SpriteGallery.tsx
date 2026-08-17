import { useMemo } from 'react'
import type { Element } from '@/domain/monster/monster.types'
import { generateSpriteDataUri } from '@/lib/sprite/generateSprite'
import { cn } from '@/lib/cn'

const VARIANT_COUNT = 10

type SpriteGalleryProps = {
  seed: string
  element: Element
  value: string
  onPick: (url: string) => void
}

/**
 * Variações procedurais do sprite, todas derivadas do nome e do elemento atuais.
 * Clicar preenche `image_url` com o data URI escolhido — nada é buscado na rede.
 */
export const SpriteGallery = ({ seed, element, value, onPick }: SpriteGalleryProps) => {
  const variants = useMemo(
    () =>
      Array.from({ length: VARIANT_COUNT }, (_, index) => ({
        key: index,
        url: generateSpriteDataUri(`${seed || '?'}#${index}`, element),
      })),
    [seed, element],
  )

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-dim text-[10px] tracking-[0.2em] uppercase">Ou escolha um sprite</span>
      <div className="flex flex-wrap gap-1.5">
        {variants.map((variant) => (
          <button
            key={variant.key}
            type="button"
            onClick={() => onPick(variant.url)}
            aria-label={`Usar variação ${variant.key + 1}`}
            aria-pressed={value === variant.url}
            className={cn(
              'bg-void pixel-border-lo grid size-10 cursor-pointer place-items-center',
              value === variant.url && 'pixel-border-amber',
            )}
          >
            <img src={variant.url} alt="" className="pixelated size-8 object-contain" />
          </button>
        ))}
      </div>
    </div>
  )
}
