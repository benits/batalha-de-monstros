import { useEffect, useState } from 'react'
import type { Element } from '@/domain/monster/monster.types'
import { generateSpriteDataUri } from '@/lib/sprite/generateSprite'
import { cn } from '@/lib/cn'

type SpriteProps = {
  name: string
  element: Element
  imageUrl?: string
  size?: number
  className?: string
}

/**
 * Usa `imageUrl` quando existe; cai no sprite procedural quando ela está
 * vazia ou falha ao carregar. Nunca mostra imagem quebrada.
 */
export const Sprite = ({ name, element, imageUrl, size = 64, className }: SpriteProps) => {
  const fallback = generateSpriteDataUri(name || '?', element)
  const [source, setSource] = useState(imageUrl || fallback)

  useEffect(() => {
    setSource(imageUrl || fallback)
  }, [imageUrl, fallback])

  return (
    <img
      src={source}
      alt={`Sprite de ${name}`}
      width={size}
      height={size}
      onError={() => setSource(fallback)}
      className={cn('pixelated block object-contain', className)}
      style={{ width: size, height: size }}
    />
  )
}
