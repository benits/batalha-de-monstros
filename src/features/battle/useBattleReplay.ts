import { useCallback, useEffect, useRef, useState } from 'react'
import type { Monster } from '@/domain/monster/monster.types'
import { simulateBattle } from '@/domain/battle/battle.engine'
import type { BattleResult, Round } from '@/domain/battle/battle.types'
import { useSettingsStore } from '@/store/settings.store'
import { useBattlesStore } from '@/store/battles.store'
import { useSfx } from '@/lib/audio/useSfx'

const BASE_STEP_MS = 1050

export type ReplayStatus = 'idle' | 'playing' | 'finished'

/**
 * Concentra todo o estado do replay. A batalha inteira é calculada no `start`;
 * daqui pra frente é só reprodução do array de rounds — nada é recalculado.
 */
export const useBattleReplay = (monsterA: Monster, monsterB: Monster) => {
  const mode = useSettingsStore((state) => state.mode)
  const speed = useSettingsStore((state) => state.speed)
  const recordBattle = useBattlesStore((state) => state.recordBattle)
  const play = useSfx()

  const [result, setResult] = useState<BattleResult | null>(null)
  const [cursor, setCursor] = useState(0)
  const [status, setStatus] = useState<ReplayStatus>('idle')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const stopTimer = () => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
  }

  const reset = useCallback(() => {
    stopTimer()
    setResult(null)
    setCursor(0)
    setStatus('idle')
  }, [])

  // Trocar de lutador ou de modo invalida o replay em andamento.
  useEffect(() => {
    reset()
  }, [monsterA.id, monsterB.id, mode, reset])

  useEffect(() => stopTimer, [])

  const finish = useCallback(
    (battle: BattleResult) => {
      setStatus('finished')
      play('win')
      const winner = battle.winnerId === monsterA.id ? monsterA : monsterB
      const loser = battle.winnerId === monsterA.id ? monsterB : monsterA
      recordBattle({
        mode: battle.mode,
        winnerName: winner.name,
        loserName: loser.name,
        rounds: battle.rounds.length,
      })
    },
    [monsterA, monsterB, play, recordBattle],
  )

  const start = useCallback(() => {
    if (status !== 'idle') return

    // Todos os rounds calculados de uma vez, antes de qualquer animação.
    const battle = simulateBattle(monsterA, monsterB, mode)
    setResult(battle)
    setCursor(0)
    setStatus('playing')

    const advance = (index: number) => {
      if (index >= battle.rounds.length) {
        finish(battle)
        return
      }
      const round = battle.rounds[index]
      setCursor(index + 1)
      play(round.effectiveness > 1 ? 'crit' : round.effectiveness < 1 ? 'weak' : 'hit')
      timer.current = setTimeout(() => advance(index + 1), BASE_STEP_MS / speed)
    }

    advance(0)
  }, [finish, mode, monsterA, monsterB, play, speed, status])

  const skip = useCallback(() => {
    stopTimer()
    const battle = result ?? simulateBattle(monsterA, monsterB, mode)
    setResult(battle)
    setCursor(battle.rounds.length)
    finish(battle)
  }, [finish, mode, monsterA, monsterB, result])

  const currentRound: Round | null = result && cursor > 0 ? result.rounds[cursor - 1] : null

  return {
    result,
    currentRound,
    cursor,
    status,
    hpA: currentRound ? currentRound.hpA : monsterA.hp,
    hpB: currentRound ? currentRound.hpB : monsterB.hp,
    start,
    skip,
    reset,
  }
}
