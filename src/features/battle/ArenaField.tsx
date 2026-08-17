import type { Monster } from '@/domain/monster/monster.types'
import type { Round } from '@/domain/battle/battle.types'
import { Fighter } from './Fighter'

type ArenaFieldProps = {
  challenger: Monster
  opponent: Monster
  hpA: number
  hpB: number
  currentRound: Round | null
  winner: Monster | null
  loser: Monster | null
  totalRounds: number
}

/** O campo em si: chão, os dois lutadores e o banner de vitória. */
export const ArenaField = ({
  challenger,
  opponent,
  hpA,
  hpB,
  currentRound,
  winner,
  loser,
  totalRounds,
}: ArenaFieldProps) => (
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

    {winner && loser && (
      <div
        data-testid="winner-banner"
        data-winner={winner.name}
        data-rounds={totalRounds}
        className="absolute top-1/2 left-1/2 z-20 w-[min(90%,380px)] -translate-x-1/2 -translate-y-1/2 bg-[rgb(11_10_20/0.94)] p-4 text-center shadow-[0_-3px_0_var(--color-amber),0_3px_0_var(--color-amber)]"
      >
        <p className="text-amber text-lg font-bold tracking-[0.16em] uppercase">
          {winner.name} venceu!
        </p>
        <p className="text-dim mt-1.5 text-[11px] tracking-wider uppercase">
          {totalRounds} rounds · {loser.name} caiu
        </p>
      </div>
    )}
  </div>
)
