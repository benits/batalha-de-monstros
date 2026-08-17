import { useBattlesStore } from '@/store/battles.store'
import { BATTLE_MODE_LABEL } from '@/store/settings.store'
import { PixelPanel } from '@/components/ui/PixelPanel'
import { Button } from '@/components/ui/Button'

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(iso))

export const HistoryScreen = () => {
  const history = useBattlesStore((state) => state.history)
  const clearHistory = useBattlesStore((state) => state.clearHistory)

  return (
    <section>
      <header className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-[15px] font-bold tracking-[0.2em] uppercase">Histórico</h2>
        {history.length > 0 && (
          <Button variant="ghost" onClick={clearHistory}>
            Limpar
          </Button>
        )}
      </header>

      {history.length === 0 ? (
        <PixelPanel className="grid place-items-center p-10">
          <p className="text-dim text-[13px]">Nenhuma batalha ainda. Vá para a arena.</p>
        </PixelPanel>
      ) : (
        <ul className="flex flex-col gap-2">
          {history.map((entry) => (
            <PixelPanel
              as="li"
              key={entry.id}
              className="flex flex-wrap items-center justify-between gap-3 p-3 text-[12px]"
            >
              <span>
                <b className="text-lime">{entry.winnerName}</b>
                <span className="text-dim"> venceu </span>
                <b className="text-dim">{entry.loserName}</b>
              </span>
              <span className="text-dim text-[10px] tracking-wider tabular-nums uppercase">
                {entry.rounds} rounds · modo {(BATTLE_MODE_LABEL[entry.mode] ?? entry.mode).toLowerCase()} ·{' '}
                {formatDate(entry.foughtAt)}
              </span>
            </PixelPanel>
          ))}
        </ul>
      )}
    </section>
  )
}
