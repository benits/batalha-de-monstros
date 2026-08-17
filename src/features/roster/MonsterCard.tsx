import type { Monster } from '@/domain/monster/monster.types'
import { levelOf } from '@/domain/monster/monster.rules'
import { unlockedPowers } from '@/domain/powers/powers.rules'
import { PixelPanel } from '@/components/ui/PixelPanel'
import { Button } from '@/components/ui/Button'
import { Sprite } from '@/components/ui/Sprite'
import { StatBar } from '@/components/ui/StatBar'
import { STAT_KEYS } from '@/domain/monster/stats'
import { ElementBadge } from '@/components/ui/ElementBadge'

type MonsterCardProps = {
  monster: Monster
  onEdit: (monster: Monster) => void
  onRemove: (monster: Monster) => void
}

export const MonsterCard = ({ monster, onEdit, onRemove }: MonsterCardProps) => {
  const level = levelOf(monster)
  const powers = unlockedPowers(monster.element, level)

  return (
    <PixelPanel as="article" className="flex flex-col gap-3 p-3">
      <div className="flex items-center gap-3">
        <div className="bg-void pixel-border-lo grid size-16 shrink-0 place-items-center">
          <Sprite
            name={monster.name}
            element={monster.element}
            imageUrl={monster.imageUrl}
            size={48}
          />
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-xs font-bold tracking-wide uppercase">{monster.name}</h3>
          <p className="text-dim text-[10px] tracking-widest uppercase">Nível {level}</p>
          <ElementBadge element={monster.element} className="mt-1" />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        {STAT_KEYS.map((stat) => (
          <StatBar key={stat} stat={stat} value={monster[stat]} />
        ))}
      </div>

      <p className="text-dim text-[10px] leading-relaxed">
        {powers.map((power) => power.name).join(' · ')}
      </p>

      <div className="flex gap-2">
        <Button variant="ghost" className="flex-1 px-2 py-2" onClick={() => onEdit(monster)}>
          Editar
        </Button>
        <Button
          variant="ghost"
          className="px-3 py-2"
          onClick={() => onRemove(monster)}
          aria-label={`Excluir ${monster.name}`}
        >
          ✕
        </Button>
      </div>
    </PixelPanel>
  )
}
