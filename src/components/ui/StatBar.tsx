import { STAT_LABEL, STAT_MAX, type StatKey } from '@/domain/monster/stats'
import { cn } from '@/lib/cn'

const STAT_COLOR: Record<StatKey, string> = {
  attack: 'bg-rose',
  defense: 'bg-cyan',
  speed: 'bg-amber',
  hp: 'bg-lime',
}

type StatBarProps = {
  stat: StatKey
  value: number
  max?: number
  className?: string
}

export const StatBar = ({ stat, value, max, className }: StatBarProps) => {
  const ceiling = max ?? STAT_MAX[stat]
  const percent = Math.min(100, Math.max(0, (value / ceiling) * 100))

  return (
    <div className={cn('grid grid-cols-[26px_1fr_32px] items-center gap-2', className)}>
      <span className="text-dim text-[9px] tracking-widest">{STAT_LABEL[stat]}</span>
      <span className="bg-void pixel-border-lo h-2">
        <span
          className={cn('block h-full transition-[width] duration-500', STAT_COLOR[stat])}
          style={{ width: `${percent}%` }}
        />
      </span>
      <span className="text-right text-[11px] tabular-nums">{value}</span>
    </div>
  )
}
