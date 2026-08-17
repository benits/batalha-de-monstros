import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type PixelPanelOwnProps = {
  tone?: 'panel' | 'sunken' | 'quiet'
  className?: string
  children: ReactNode
}

type PixelPanelProps<T extends ElementType> = PixelPanelOwnProps & {
  as?: T
} & Omit<ComponentPropsWithoutRef<T>, keyof PixelPanelOwnProps | 'as'>

const TONE_CLASS = {
  panel: 'bg-panel pixel-border',
  sunken: 'bg-void pixel-border-lo',
  quiet: 'bg-transparent pixel-border-lo',
} as const

/**
 * Superfície padrão do app. Nenhum outro arquivo declara a borda pixelada.
 * Polimórfico: `as="form"`, `as="li"`, `as="article"` mantêm os props do elemento.
 */
export const PixelPanel = <T extends ElementType = 'div'>({
  as,
  tone = 'panel',
  className,
  children,
  ...rest
}: PixelPanelProps<T>) => {
  const Tag = (as ?? 'div') as ElementType

  return (
    <Tag className={cn(TONE_CLASS[tone], className)} {...rest}>
      {children}
    </Tag>
  )
}
