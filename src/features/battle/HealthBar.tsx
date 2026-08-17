import { cn } from '@/lib/cn'

const toneFor = (percent: number) =>
  percent <= 25 ? 'bg-rose' : percent <= 55 ? 'bg-amber' : 'bg-lime'

type HealthBarProps = {
  name: string
  current: number
  max: number
}

export const HealthBar = ({ name, current, max }: HealthBarProps) => {
  const percent = Math.min(100, Math.max(0, (current / max) * 100))

  return (
    <div className="flex w-full max-w-[230px] flex-col gap-1">
      <div className="flex items-baseline justify-between gap-2">
        <span className="truncate text-[11px] tracking-wider uppercase">{name}</span>
        <span className="text-dim text-xs tabular-nums">
          {current}/{max}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={`HP de ${name}`}
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={max}
        className="h-3.5 bg-[#07060F] shadow-[inset_0_0_0_2px_var(--color-edge)]"
      >
        <span
          className={cn(
            'block h-full transition-[width,background-color] duration-300',
            toneFor(percent),
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
