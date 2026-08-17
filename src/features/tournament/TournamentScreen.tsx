import { useMemo, useState } from 'react'
import type { Monster } from '@/domain/monster/monster.types'
import {
  championId,
  createTournament,
  isTournamentOver,
  nextPlayableMatch,
  playMatch,
  roundLabel,
  totalRounds,
  type Tournament,
  type TournamentMatch,
} from '@/domain/tournament/tournament'
import { powerScore } from '@/domain/monster/monster.rules'
import { BATTLE_MODE_LABEL, damageModeOf, useSettingsStore } from '@/store/settings.store'
import { useBattlesStore } from '@/store/battles.store'
import { useSfx } from '@/lib/audio/useSfx'
import { PixelPanel } from '@/components/ui/PixelPanel'
import { Button } from '@/components/ui/Button'
import { Sprite } from '@/components/ui/Sprite'
import { cn } from '@/lib/cn'

const SIZES = [4, 8] as const
type Size = (typeof SIZES)[number]

type TournamentScreenProps = { monsters: Monster[] }

const Slot = ({
  monster,
  won,
  lost,
}: {
  monster?: Monster
  won: boolean
  lost: boolean
}) => (
  <div
    className={cn(
      'flex items-center gap-2 px-2 py-1.5',
      won && 'bg-panel-hi',
      lost && 'opacity-40',
    )}
  >
    {monster ? (
      <>
        <Sprite
          name={monster.name}
          element={monster.element}
          imageUrl={monster.imageUrl}
          size={20}
        />
        <span className={cn('truncate text-[10px] tracking-wider uppercase', won && 'text-lime')}>
          {monster.name}
        </span>
      </>
    ) : (
      <span className="text-dim text-[10px] tracking-widest uppercase">a definir</span>
    )}
  </div>
)

const MatchCard = ({
  match,
  byId,
  isNext,
}: {
  match: TournamentMatch
  byId: Record<string, Monster>
  isNext: boolean
}) => (
  <PixelPanel
    tone={isNext ? 'panel' : 'quiet'}
    data-testid="bracket-match"
    data-match={match.id}
    data-winner={match.winnerId ? byId[match.winnerId]?.name : undefined}
    className={cn('flex flex-col gap-0.5 p-1.5', isNext && 'pixel-border-amber')}
  >
    <Slot
      monster={match.aId ? byId[match.aId] : undefined}
      won={match.winnerId === match.aId && match.aId !== undefined}
      lost={match.loserId === match.aId && match.aId !== undefined}
    />
    <Slot
      monster={match.bId ? byId[match.bId] : undefined}
      won={match.winnerId === match.bId && match.bId !== undefined}
      lost={match.loserId === match.bId && match.bId !== undefined}
    />
    {match.roundCount !== undefined && (
      <span className="text-dim px-2 text-[9px] tracking-widest tabular-nums uppercase">
        {match.roundCount} rounds
      </span>
    )}
  </PixelPanel>
)

export const TournamentScreen = ({ monsters }: TournamentScreenProps) => {
  const mode = useSettingsStore((state) => state.mode)
  const recordBattle = useBattlesStore((state) => state.recordBattle)
  const play = useSfx()

  const [size, setSize] = useState<Size>(4)
  const [tournament, setTournament] = useState<Tournament | null>(null)

  const byId = useMemo(
    () => Object.fromEntries(monsters.map((monster) => [monster.id, monster])),
    [monsters],
  )

  /** Os mais fortes entram; assim uma chave de 4 com 6 monstros faz sentido. */
  const seeded = useMemo(
    () => [...monsters].sort((a, b) => powerScore(b) - powerScore(a)).slice(0, size),
    [monsters, size],
  )

  const canStart = monsters.length >= size

  const start = () => {
    setTournament(createTournament(seeded.map((monster) => monster.id), damageModeOf(mode)))
    play('select')
  }

  const playNext = () => {
    if (!tournament) return
    const match = nextPlayableMatch(tournament)
    if (!match) return

    const next = playMatch(tournament, match.id, byId)
    setTournament(next)

    const played = next.matches.find((entry) => entry.id === match.id)!
    play(isTournamentOver(next) ? 'win' : 'hit')
    recordBattle({
      mode,
      winnerName: byId[played.winnerId!].name,
      loserName: byId[played.loserId!].name,
      rounds: played.roundCount!,
    })
  }

  const playAll = () => {
    if (!tournament) return
    let next = tournament
    let guard = 0
    while (!isTournamentOver(next) && guard++ < 64) {
      const match = nextPlayableMatch(next)
      if (!match) break
      next = playMatch(next, match.id, byId)
      const played = next.matches.find((entry) => entry.id === match.id)!
      recordBattle({
        mode,
        winnerName: byId[played.winnerId!].name,
        loserName: byId[played.loserId!].name,
        rounds: played.roundCount!,
      })
    }
    setTournament(next)
    play('win')
  }

  const champion = tournament ? championId(tournament) : null
  const upcoming = tournament ? nextPlayableMatch(tournament) : null

  return (
    <section>
      <header className="mb-4 flex flex-wrap items-baseline gap-3">
        <h2 className="text-[15px] font-bold tracking-[0.2em] uppercase">Torneio</h2>
        <span className="text-dim text-[10px] tracking-[0.2em] uppercase">
          Eliminação simples · modo {BATTLE_MODE_LABEL[mode].toLowerCase()}
        </span>
      </header>

      {!tournament ? (
        <PixelPanel className="flex flex-col gap-4 p-5">
          <p className="text-dim text-[13px] leading-relaxed">
            Os {size} monstros mais fortes do seu roster entram na chave. Cada confronto usa o mesmo
            motor de batalha do duelo 1×1 — o torneio só encadeia os resultados.
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-dim text-[10px] tracking-[0.2em] uppercase">Tamanho</span>
            {SIZES.map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={size === option}
                onClick={() => setSize(option)}
                className={cn(
                  'pixel-border-lo cursor-pointer px-3 py-1.5 text-[11px] tracking-wider uppercase',
                  size === option ? 'bg-cyan text-void' : 'bg-panel-hi text-dim hover:text-paper',
                )}
              >
                {option} monstros
              </button>
            ))}
          </div>

          {canStart ? (
            <div className="flex flex-wrap gap-2">
              {seeded.map((monster) => (
                <span
                  key={monster.id}
                  className="bg-void pixel-border-lo flex items-center gap-2 px-2 py-1"
                >
                  <Sprite
                    name={monster.name}
                    element={monster.element}
                    imageUrl={monster.imageUrl}
                    size={20}
                  />
                  <span className="text-[10px] tracking-wider uppercase">{monster.name}</span>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-rose text-[12px]">
              Você tem {monsters.length} monstros. Cadastre pelo menos {size} para montar esta chave.
            </p>
          )}

          <div>
            <Button onClick={start} disabled={!canStart}>
              Montar chave
            </Button>
          </div>
        </PixelPanel>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={playNext} disabled={!upcoming}>
              ▶ Próximo confronto
            </Button>
            <Button variant="ghost" onClick={playAll} disabled={!upcoming}>
              Simular tudo ⏭
            </Button>
            <Button variant="ghost" onClick={() => setTournament(null)}>
              Nova chave ↺
            </Button>
          </div>

          {champion && (
            <PixelPanel
              data-testid="tournament-champion"
              data-champion={byId[champion]?.name}
              className="flex items-center gap-4 p-4"
            >
              <Sprite
                name={byId[champion].name}
                element={byId[champion].element}
                imageUrl={byId[champion].imageUrl}
                size={56}
              />
              <div>
                <p className="text-amber text-lg font-bold tracking-[0.16em] uppercase">
                  {byId[champion].name} é campeão
                </p>
                <p className="text-dim text-[11px] tracking-wider uppercase">
                  {tournament.size} monstros · {totalRounds(tournament)} fases
                </p>
              </div>
            </PixelPanel>
          )}

          <div className="grid gap-4 overflow-x-auto" style={{ gridTemplateColumns: `repeat(${totalRounds(tournament)}, minmax(160px, 1fr))` }}>
            {Array.from({ length: totalRounds(tournament) }, (_, round) => (
              <div key={round} className="flex flex-col gap-3">
                <p className="text-dim text-center text-[10px] tracking-[0.2em] uppercase">
                  {roundLabel(tournament, round)}
                </p>
                <div className="flex flex-1 flex-col justify-around gap-3">
                  {tournament.matches
                    .filter((match) => match.round === round)
                    .map((match) => (
                      <MatchCard
                        key={match.id}
                        match={match}
                        byId={byId}
                        isNext={upcoming?.id === match.id}
                      />
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
