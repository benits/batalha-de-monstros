import type { Element } from '@/domain/monster/monster.types'
import { ELEMENTS } from '@/domain/powers/elements'
import { cn } from '@/lib/cn'

export const ElementBadge = ({ element, className }: { element: Element; className?: string }) => {
  const meta = ELEMENTS[element]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] tracking-widest uppercase',
        className,
      )}
      style={{ color: meta.color, boxShadow: `inset 0 0 0 2px ${meta.color}` }}
    >
      <span aria-hidden>{meta.glyph}</span>
      {meta.label}
    </span>
  )
}
