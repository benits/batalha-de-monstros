import type { Monster } from '@/domain/monster/monster.types'
import {
  BATTLE_MODE_LABEL,
  isInteractive,
  useSettingsStore,
} from '@/store/settings.store'
import { Button } from '@/components/ui/Button'
import { useBattleReplay } from './useBattleReplay'
import { ArenaField } from './ArenaField'
import { BattleLog } from './BattleLog'
import { DuelArena } from './DuelArena'

type ArenaScreenProps = {
  challenger: Monster
  opponent: Monster
}

/** Modo automático: reproduz o array de rounds que o motor já calculou. */
const AutoArena = ({ challenger, opponent }: ArenaScreenProps) => {
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

  const narration =
    result && winner
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
            {BATTLE_MODE_LABEL[mode].toLowerCase()}
          </span>
        </header>

        <ArenaField
          challenger={challenger}
          opponent={opponent}
          hpA={hpA}
          hpB={hpB}
          currentRound={currentRound}
          winner={winner}
          loser={loser}
          totalRounds={result?.rounds.length ?? 0}
        />

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
        <BattleLog rounds={result?.rounds ?? []} cursor={cursor} monsters={monsters} />
      </div>

      {/* Narração da batalha para leitor de tela: um round por anúncio,
          em vez de reler o log inteiro a cada atualização. */}
      <p className="sr-only" role="status" aria-live="polite" data-testid="battle-narration">
        {narration}
      </p>
    </section>
  )
}

export const ArenaScreen = (props: ArenaScreenProps) => {
  const mode = useSettingsStore((state) => state.mode)
  return isInteractive(mode) ? <DuelArena {...props} /> : <AutoArena {...props} />
}
