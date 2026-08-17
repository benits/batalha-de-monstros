import type { Monster } from '@/domain/monster/monster.types'
import { resolveFirstAttacker } from '@/domain/battle/turn-order'
import { advantage } from '@/domain/powers/elements'
import { levelOf } from '@/domain/monster/monster.rules'
import { useSettingsStore } from '@/store/settings.store'
import { useSfx } from '@/lib/audio/useSfx'
import { PixelPanel } from '@/components/ui/PixelPanel'
import { Button } from '@/components/ui/Button'
import { Sprite } from '@/components/ui/Sprite'
import { ElementBadge } from '@/components/ui/ElementBadge'
import { STAT_FULL_LABEL, STAT_KEYS } from '@/domain/monster/stats'
import { cn } from '@/lib/cn'

type SlotProps = {
  title: string
  monster: Monster
  monsters: Monster[]
  onPick: (id: string) => void
}

const Slot = ({ title, monster, monsters, onPick }: SlotProps) => (
  <PixelPanel className="flex flex-col items-center gap-3 p-4">
    <span className="text-dim text-[10px] tracking-[0.2em] uppercase">{title}</span>
    <div className="bg-void pixel-border-lo grid size-26 place-items-center">
      <Sprite name={monster.name} element={monster.element} imageUrl={monster.imageUrl} size={84} />
    </div>
    <h3 className="text-center text-sm font-bold tracking-wider uppercase">{monster.name}</h3>
    <div className="flex items-center gap-2">
      <ElementBadge element={monster.element} />
      <span className="text-dim text-[9px] tracking-widest uppercase">Nível {levelOf(monster)}</span>
    </div>
    <div className="flex flex-wrap justify-center gap-1.5">
      {monsters.map((candidate) => (
        <button
          key={candidate.id}
          type="button"
          aria-pressed={candidate.id === monster.id}
          onClick={() => onPick(candidate.id)}
          className={cn(
            'pixel-border-lo cursor-pointer px-2.5 py-1.5 text-[10px] tracking-wider uppercase',
            /* Mesmo cuidado das abas: o hover não sobrescreve o estado selecionado. */
            candidate.id === monster.id
              ? 'bg-cyan text-void'
              : 'bg-panel-hi text-dim hover:text-paper',
          )}
        >
          {candidate.name.split(' ')[0]}
        </button>
      ))}
    </div>
  </PixelPanel>
)

type SelectScreenProps = {
  monsters: Monster[]
  challenger: Monster
  opponent: Monster
  onPick: (side: 'a' | 'b', id: string) => void
  onFight: () => void
}

export const SelectScreen = ({
  monsters,
  challenger,
  opponent,
  onPick,
  onFight,
}: SelectScreenProps) => {
  const mode = useSettingsStore((state) => state.mode)
  const setMode = useSettingsStore((state) => state.setMode)
  const play = useSfx()

  const order = resolveFirstAttacker(challenger, opponent)
  const matchup = advantage(challenger.element, opponent.element)

  return (
    <section>
      <header className="mb-4 flex items-baseline gap-3">
        <h2 className="text-[15px] font-bold tracking-[0.2em] uppercase">Escolha os lutadores</h2>
        <span className="text-dim text-[10px] tracking-[0.2em] uppercase">
          Compare antes de apostar
        </span>
      </header>

      <div className="grid items-center gap-4 md:grid-cols-[1fr_92px_1fr]">
        <Slot
          title="Desafiante"
          monster={challenger}
          monsters={monsters}
          onPick={(id) => onPick('a', id)}
        />
        <p className="text-amber grid place-items-center text-2xl font-bold drop-shadow-[0_0_20px_rgba(255,197,61,0.6)]">
          VS
        </p>
        <Slot
          title="Oponente"
          monster={opponent}
          monsters={monsters}
          onPick={(id) => onPick('b', id)}
        />
      </div>

      <div className="mx-auto mt-6 flex max-w-[300px] flex-col gap-1.5">
        {STAT_KEYS.map((stat) => (
          <div key={stat} className="grid grid-cols-[44px_1fr_44px] items-center gap-2 text-[11px]">
            <b
              className={cn(
                'text-right tabular-nums',
                challenger[stat] > opponent[stat] ? 'text-lime' : 'text-dim',
              )}
            >
              {challenger[stat]}
            </b>
            <span className="text-dim text-center text-[9px] tracking-widest uppercase">
              {STAT_FULL_LABEL[stat]}
            </span>
            <b
              className={cn(
                'tabular-nums',
                opponent[stat] > challenger[stat] ? 'text-lime' : 'text-dim',
              )}
            >
              {opponent[stat]}
            </b>
          </div>
        ))}
      </div>

      <p
        data-testid="first-attacker"
        data-first={order.first.name}
        data-reason={order.reason}
        className="text-dim mt-4 text-center text-[11px] tracking-wider uppercase"
      >
        <b className="text-amber">{order.first.name}</b> ataca primeiro —{' '}
        {order.reason === 'speed' ? 'maior velocidade' : 'maior ataque no desempate'}
      </p>

      {mode === 'arena' && matchup !== 1 && (
        <p className="text-dim mt-1 text-center text-[11px] tracking-wider uppercase">
          {challenger.name} é {matchup > 1 ? 'forte' : 'fraco'} contra {opponent.name}
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <Button
          variant="ghost"
          onClick={() => {
            setMode(mode === 'classic' ? 'arena' : 'classic')
            play('select')
          }}
          title="Clássico usa a fórmula exata do enunciado. Arena adiciona poderes e vantagem elemental."
        >
          Modo: {mode === 'classic' ? 'Clássico' : 'Arena'}
        </Button>
        <Button onClick={onFight}>Para a arena →</Button>
      </div>

      <p className="text-dim mx-auto mt-3 max-w-[52ch] text-center text-[11px] leading-relaxed">
        {mode === 'classic'
          ? 'Clássico: dano = ataque − defesa, mínimo 1. A fórmula do enunciado, sem nenhuma adição.'
          : 'Arena: o dano clássico passa pelo poder do round e pela vantagem elemental.'}
      </p>
    </section>
  )
}
