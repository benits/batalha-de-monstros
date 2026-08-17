import type { Monster } from '@/domain/monster/monster.types'
import type { Round } from '@/domain/battle/battle.types'
import { POWERS } from '@/domain/powers/powers.catalog'
import { ELEMENTS } from '@/domain/powers/elements'
import { Sprite } from '@/components/ui/Sprite'
import { cn } from '@/lib/cn'
import { HealthBar } from './HealthBar'
import { PowerEffect } from './PowerEffect'

type FighterProps = {
  monster: Monster
  hp: number
  facing: 'left' | 'right'
  /** Round atual quando este monstro está apanhando; `null` caso contrário. */
  incoming: Round | null
}

export const Fighter = ({ monster, hp, facing, incoming }: FighterProps) => {
  const power = incoming?.powerId
    ? POWERS.find((entry) => entry.id === incoming.powerId)
    : undefined
  const effectColor = power ? ELEMENTS[power.element].color : 'var(--color-rose)'

  return (
    <div
      className={cn(
        'relative z-10 flex flex-col items-center gap-2',
        incoming && 'animate-[hit-shake_0.32s_steps(4,end)]',
      )}
    >
      <HealthBar name={monster.name} current={hp} max={monster.hp} />

      <p
        className="h-4 text-center text-[10px] tracking-widest uppercase"
        style={{ color: effectColor }}
      >
        {incoming && power && (
          <>
            {power.name}
            {incoming.effectiveness > 1 && ' · super efetivo'}
            {incoming.effectiveness < 1 && ' · pouco efetivo'}
          </>
        )}
      </p>

      {/* A `key` no número do round reinicia as animações a cada golpe. */}
      <div className="relative grid h-28 w-28 place-items-center">
        <Sprite
          name={monster.name}
          element={monster.element}
          imageUrl={monster.imageUrl}
          size={112}
          className={cn(
            'animate-[bob_1.9s_steps(2,end)_infinite]',
            facing === 'right' && '-scale-x-100',
          )}
        />

        {incoming && power && (
          <PowerEffect key={`fx-${incoming.round}`} kind={power.animation} color={effectColor} />
        )}

        {incoming && (
          <span
            key={`dmg-${incoming.round}`}
            className="text-rose pointer-events-none absolute top-0 left-1/2 text-2xl font-bold tabular-nums drop-shadow-[0_0_12px_rgba(255,77,109,0.7)]"
            style={{ animation: 'damage-rise 0.9s ease-out forwards' }}
          >
            -{incoming.damage}
          </span>
        )}
      </div>
    </div>
  )
}
