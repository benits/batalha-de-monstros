import type { Monster } from '@/domain/monster/monster.types'
import { useSettingsStore } from '@/store/settings.store'
import { Button } from '@/components/ui/Button'
import { useBattleReplay } from './useBattleReplay'
import { Fighter } from './Fighter'
import { BattleLog } from './BattleLog'

type ArenaScreenProps = {
  challenger: Monster
  opponent: Monster
}

export const ArenaScreen = ({ challenger, opponent }: ArenaScreenProps) => {
  const speed = useSettingsStore((state) => state.speed)
  const cycleSpeed = useSettingsStore((state) => state.cycleSpeed)
  const mode = useSettingsStore((state) => state.mode)

  const { result, currentRound, cursor, status, hpA, hpB, start, skip, reset } = useBattleReplay(
    challenger,
    opponent,
  )

  const monsters: Record<string, Monster> = {
    [challenger.id]: challenger,
    [opponent.id]: opponent,
  }
  const finished = status === 'finished' && result !== null
  const winner = finished ? monsters[result.winnerId] : null
  const loser = finished ? monsters[result.loserId] : null

  const narration = result && winner
    ? `Fim da batalha. ${winner.name} venceu em ${result.rounds.length} rounds.`
    : currentRound
      ? `Round ${currentRound.round}. ${monsters[currentRound.attackerId]?.name} atacou ${
          monsters[currentRound.defenderId]?.name
        } causando ${currentRound.damage} de dano.`
      : ''

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div>
        <header className="mb-4 flex flex-wrap items-baseline gap-3">
          <h2 className="text-[15px] font-bold tracking-[0.2em] uppercase">Arena</h2>
          <span className="text-dim text-[10px] tracking-[0.2em] tabular-nums uppercase">
            {result ? `Round ${cursor} / ${result.rounds.length}` : 'Round —'} · modo{' '}
            {mode === 'classic' ? 'clássico' : 'arena'}
          </span>
        </header>

        <div className="relative grid min-h-[300px] grid-cols-2 items-end gap-4 overflow-hidden bg-gradient-to-b from-[#141127] to-[#0B0A14] px-4 pt-6 pb-10 shadow-[inset_0_0_0_2px_var(--color-edge-lo)]">
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-10 shadow-[inset_0_2px_0_var(--color-edge-lo)]"
            style={{ background: 'repeating-linear-gradient(90deg,#1D1A33 0 8px,#191630 8px 16px)' }}
          />

          <Fighter
            monster={challenger}
            hp={hpA}
            facing="left"
            incoming={currentRound?.defenderId === challenger.id ? currentRound : null}
          />
          <Fighter
            monster={opponent}
            hp={hpB}
            facing="right"
            incoming={currentRound?.defenderId === opponent.id ? currentRound : null}
          />

          {winner && loser && result && (
            <div
              data-testid="winner-banner"
              data-winner={winner.name}
              data-rounds={result.rounds.length}
              className="absolute top-1/2 left-1/2 z-20 w-[min(90%,380px)] -translate-x-1/2 -translate-y-1/2 bg-[rgb(11_10_20/0.94)] p-4 text-center shadow-[0_-3px_0_var(--color-amber),0_3px_0_var(--color-amber)]"
            >
              <p className="text-amber text-lg font-bold tracking-[0.16em] uppercase">
                {winner.name} venceu!
              </p>
              <p className="text-dim mt-1.5 text-[11px] tracking-wider uppercase">
                {result.rounds.length} rounds · {loser.name} caiu
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {/* O botão primário sempre tem uma próxima ação: lutar, esperar ou lutar de novo. */}
          <Button
            onClick={finished ? reset : start}
            disabled={status === 'playing'}
            title={finished ? 'Recalcula a batalha do zero' : undefined}
          >
            {status === 'playing'
              ? '▶ Batalhando…'
              : finished
                ? '↺ Lutar de novo'
                : '▶ Iniciar batalha'}
          </Button>
          <Button variant="ghost" onClick={cycleSpeed}>
            Velocidade {speed}×
          </Button>
          <Button variant="ghost" onClick={skip} disabled={finished}>
            Pular ⏭
          </Button>
        </div>
      </div>

      <div>
        <p className="text-dim mb-2 text-[10px] tracking-[0.2em] uppercase">Log da batalha</p>
        <BattleLog result={result} cursor={cursor} monsters={monsters} />
      </div>

      {/* Narração da batalha para leitor de tela: um round por anúncio,
          em vez de reler o log inteiro a cada atualização. */}
      <p className="sr-only" role="status" aria-live="polite" data-testid="battle-narration">
        {narration}
      </p>
    </section>
  )
}
