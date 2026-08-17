import { useEffect, useState } from 'react'
import { useMonstersStore } from '@/store/monsters.store'
import { useSettingsStore } from '@/store/settings.store'
import { RosterScreen } from '@/features/roster/RosterScreen'
import { SelectScreen } from '@/features/battle/SelectScreen'
import { ArenaScreen } from '@/features/battle/ArenaScreen'
import { HistoryScreen } from '@/features/history/HistoryScreen'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'

type Screen = 'roster' | 'select' | 'arena' | 'history'

const TABS: { id: Screen; label: string }[] = [
  { id: 'roster', label: '01 · Roster' },
  { id: 'select', label: '02 · Seleção' },
  { id: 'arena', label: '03 · Arena' },
  { id: 'history', label: '04 · Histórico' },
]

export const App = () => {
  const monsters = useMonstersStore((state) => state.monsters)
  const muted = useSettingsStore((state) => state.muted)
  const toggleMuted = useSettingsStore((state) => state.toggleMuted)

  const [screen, setScreen] = useState<Screen>('roster')
  const [picks, setPicks] = useState<{ a?: string; b?: string }>({})

  // Mantém a seleção válida quando o roster muda.
  useEffect(() => {
    setPicks((current) => ({
      a: monsters.some((monster) => monster.id === current.a) ? current.a : monsters[0]?.id,
      b: monsters.some((monster) => monster.id === current.b) ? current.b : monsters[1]?.id,
    }))
  }, [monsters])

  const challenger = monsters.find((monster) => monster.id === picks.a)
  const opponent = monsters.find((monster) => monster.id === picks.b)
  const canBattle = Boolean(challenger && opponent && challenger.id !== opponent.id)

  // Escolher o monstro que já está do outro lado troca os dois de lugar.
  const pick = (side: 'a' | 'b', id: string) =>
    setPicks((current) => {
      const other = side === 'a' ? 'b' : 'a'
      return current[other] === id
        ? { ...current, [other]: current[side], [side]: id }
        : { ...current, [side]: id }
    })

  return (
    <div className="mx-auto flex max-w-[1160px] flex-col gap-8 px-6 py-12">
      <header>
        <p className="text-dim text-[11px] tracking-[0.24em] uppercase">Desafio técnico Revi</p>
        <h1 className="mt-2 text-3xl font-bold tracking-[0.14em] uppercase drop-shadow-[0_0_24px_rgba(164,92,255,0.55)] sm:text-4xl">
          Batalha de <span className="text-amber">Monstros</span>
        </h1>
      </header>

      <div className="bg-gradient-to-b from-[#1B1830] to-[#100E1E] p-6 shadow-[0_-6px_0_var(--color-edge),0_6px_0_var(--color-edge),-6px_0_0_var(--color-edge),6px_0_0_var(--color-edge)]">
        <div className="mb-4 flex flex-wrap items-center gap-1" role="tablist" aria-label="Telas">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={screen === tab.id}
              onClick={() => setScreen(tab.id)}
              className={cn(
                'bg-panel-hi text-dim pixel-border-lo cursor-pointer px-4 py-2.5 text-[11px] tracking-[0.18em] uppercase',
                'hover:text-paper transition-transform hover:-translate-y-0.5',
                screen === tab.id && 'bg-amber text-void',
              )}
            >
              {tab.label}
            </button>
          ))}
          <Button
            variant="ghost"
            className="ml-auto"
            onClick={toggleMuted}
            aria-pressed={muted}
            aria-label={muted ? 'Ativar som' : 'Desativar som'}
          >
            {muted ? '🔇 Som off' : '🔊 Som on'}
          </Button>
        </div>

        <div className="scanlines relative min-h-[520px] overflow-hidden bg-[#0D0B18] p-6 shadow-[inset_0_0_0_3px_#060510,inset_0_0_60px_rgba(164,92,255,0.13)]">
          {screen === 'roster' && <RosterScreen />}

          {screen === 'select' &&
            (canBattle && challenger && opponent ? (
              <SelectScreen
                monsters={monsters}
                challenger={challenger}
                opponent={opponent}
                onPick={pick}
                onFight={() => setScreen('arena')}
              />
            ) : (
              <p className="text-dim text-[13px]">Cadastre ao menos dois monstros para batalhar.</p>
            ))}

          {screen === 'arena' &&
            (canBattle && challenger && opponent ? (
              <ArenaScreen challenger={challenger} opponent={opponent} />
            ) : (
              <p className="text-dim text-[13px]">
                Escolha dois monstros diferentes na tela de seleção.
              </p>
            ))}

          {screen === 'history' && <HistoryScreen />}
        </div>
      </div>
    </div>
  )
}
