import { useEffect, useRef } from 'react'
import type { Monster } from '@/domain/monster/monster.types'
import type { BattleResult } from '@/domain/battle/battle.types'
import { POWERS } from '@/domain/powers/powers.catalog'
import { PixelPanel } from '@/components/ui/PixelPanel'
import { cn } from '@/lib/cn'

type BattleLogProps = {
  result: BattleResult | null
  cursor: number
  monsters: Record<string, Monster>
}

export const BattleLog = ({ result, cursor, monsters }: BattleLogProps) => {
  const activeRef = useRef<HTMLLIElement>(null)

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest' })
  }, [cursor])

  if (!result) {
    return (
      <PixelPanel className="grid h-[352px] place-items-center p-3">
        <p className="text-dim max-w-[26ch] text-center text-[12px] leading-relaxed">
          Todos os rounds são calculados de uma vez ao iniciar. O que roda aqui é o replay do
          resultado.
        </p>
      </PixelPanel>
    )
  }

  return (
    <PixelPanel as="ol" className="flex h-[352px] flex-col gap-1.5 overflow-y-auto p-3">
      {result.rounds.slice(0, cursor).map((round) => {
        const isActive = round.round === cursor
        const power = round.powerId ? POWERS.find((entry) => entry.id === round.powerId) : undefined

        return (
          <li
            key={round.round}
            data-testid="log-line"
            data-round={round.round}
            data-damage={round.damage}
            data-attacker={monsters[round.attackerId]?.name}
            ref={isActive ? activeRef : undefined}
            className={cn(
              'bg-void text-dim border-edge border-l-[3px] px-2 py-1.5 text-[11px] leading-relaxed',
              isActive && 'bg-panel-hi text-paper border-amber',
            )}
          >
            <b className="text-paper">R{round.round}</b> · {monsters[round.attackerId]?.name} →{' '}
            {monsters[round.defenderId]?.name}
            {power && ` · ${power.name}`}
            <span className="text-rose font-bold tabular-nums"> -{round.damage}</span>
          </li>
        )
      })}
    </PixelPanel>
  )
}
