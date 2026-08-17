import type { Monster } from '@/domain/monster/monster.types'
import { ELEMENTS } from '@/domain/powers/elements'
import { levelOf } from '@/domain/monster/monster.rules'
import { PixelPanel } from '@/components/ui/PixelPanel'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { useTurnBattle } from './useTurnBattle'
import { BattleLog } from './BattleLog'
import { ArenaField } from './ArenaField'

type DuelArenaProps = {
  challenger: Monster
  opponent: Monster
}

export const DuelArena = ({ challenger, opponent }: DuelArenaProps) => {
  const battle = useTurnBattle(challenger, opponent)
  const monsters: Record<string, Monster> = {
    [challenger.id]: challenger,
    [opponent.id]: opponent,
  }

  const winner = battle.winnerId ? monsters[battle.winnerId] : null
  const loser = battle.loserId ? monsters[battle.loserId] : null
  const accent = ELEMENTS[challenger.element].color

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div>
        <header className="mb-4 flex flex-wrap items-baseline gap-3">
          <h2 className="text-[15px] font-bold tracking-[0.2em] uppercase">Duelo por turno</h2>
          <span className="text-dim text-[10px] tracking-[0.2em] tabular-nums uppercase">
            {battle.rounds.length > 0 ? `Round ${battle.rounds.length}` : 'Round —'} ·{' '}
            {battle.finished ? 'encerrado' : battle.isPlayerTurn ? 'sua vez' : 'vez da CPU'}
          </span>
        </header>

        <ArenaField
          challenger={challenger}
          opponent={opponent}
          hpA={battle.hpA}
          hpB={battle.hpB}
          currentRound={battle.currentRound}
          winner={winner}
          loser={loser}
          totalRounds={battle.rounds.length}
        />

        <PixelPanel className="mt-4 flex flex-col gap-3 p-4">
          <p className="text-dim text-[10px] tracking-[0.2em] uppercase">
            {battle.finished
              ? 'Duelo encerrado'
              : `Escolha o golpe de ${challenger.name}`}
          </p>

          <div className="flex flex-wrap gap-2">
            {battle.powers.map((power) => (
              <button
                key={power.id}
                type="button"
                disabled={!battle.isPlayerTurn}
                onClick={() => battle.choose(power.id)}
                className={cn(
                  'bg-panel-hi pixel-border-lo flex cursor-pointer flex-col items-start gap-0.5 px-3 py-2 text-left',
                  'transition-transform hover:-translate-y-0.5',
                  'disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40',
                )}
                style={{ color: accent }}
              >
                <span className="text-[11px] font-bold tracking-wider uppercase">{power.name}</span>
                <span className="text-dim text-[9px] tracking-widest uppercase tabular-nums">
                  ×{power.multiplier} · tier {power.tier}
                </span>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" onClick={battle.reset}>
              Recomeçar ↺
            </Button>
          </div>

          {battle.powers.length === 1 && (
            <p className="text-amber text-[11px] leading-relaxed">
              {challenger.name} está no nível {levelOf(challenger)} e só destravou um golpe. Poderes
              abrem nos níveis 5 e 8 — some atributos no cadastro para ter o que escolher aqui.
            </p>
          )}

          <p className="text-dim text-[11px] leading-relaxed">
            A CPU responde sozinha com o rodízio determinístico de poderes. Este modo é o único que
            não pré-calcula a batalha — por isso fica fora do que o enunciado pede.
          </p>
        </PixelPanel>
      </div>

      <div>
        <p className="text-dim mb-2 text-[10px] tracking-[0.2em] uppercase">Log do duelo</p>
        <BattleLog
          rounds={battle.rounds}
          cursor={battle.rounds.length}
          monsters={monsters}
          emptyMessage="Escolha um golpe abaixo para começar. Aqui cada round é decidido na hora."
        />
      </div>
    </section>
  )
}
