import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Monster } from '@/domain/monster/monster.types'
import { advanceRound, createBattle, isFinished } from '@/domain/battle/battle.state'
import type { BattleState } from '@/domain/battle/battle.types'
import { levelOf } from '@/domain/monster/monster.rules'
import { unlockedPowers } from '@/domain/powers/powers.rules'
import { useBattlesStore } from '@/store/battles.store'
import { useSfx } from '@/lib/audio/useSfx'

/**
 * Modo por turno: o jogador controla o desafiante e escolhe o poder a cada
 * rodada; a CPU responde sozinha com o rodízio determinístico.
 *
 * Usa o mesmo `advanceRound` que o modo automático — só quem decide o poder
 * muda. Por isso este modo não pode divergir da regra de batalha.
 */
export const useTurnBattle = (player: Monster, opponent: Monster) => {
  const recordBattle = useBattlesStore((store) => store.recordBattle)
  const play = useSfx()

  /** Deixa a CPU jogar até a vez voltar ao jogador ou a batalha acabar. */
  const settle = useCallback(
    (from: BattleState) => {
      let next = from
      while (!isFinished(next) && next.attackerId === opponent.id) {
        next = advanceRound(player, opponent, next)
      }
      return next
    },
    [player, opponent],
  )

  const [state, setState] = useState<BattleState>(() =>
    settle(createBattle(player, opponent, 'arena')),
  )
  const [recorded, setRecorded] = useState(false)

  const reset = useCallback(() => {
    setState(settle(createBattle(player, opponent, 'arena')))
    setRecorded(false)
  }, [player, opponent, settle])

  // Trocar de lutador começa um duelo novo.
  useEffect(() => {
    reset()
  }, [reset])

  const finished = isFinished(state)

  useEffect(() => {
    if (!finished || recorded) return
    setRecorded(true)
    play('win')
    const winner = state.winnerId === player.id ? player : opponent
    const loser = state.winnerId === player.id ? opponent : player
    recordBattle({
      mode: 'duel',
      winnerName: winner.name,
      loserName: loser.name,
      rounds: state.rounds.length,
    })
  }, [finished, recorded, state, player, opponent, play, recordBattle])

  const powers = useMemo(() => unlockedPowers(player.element, levelOf(player)), [player])

  const choose = useCallback(
    (powerId: string) => {
      if (finished || state.attackerId !== player.id) return

      const afterPlayer = advanceRound(player, opponent, state, powerId)
      const lastRound = afterPlayer.rounds[afterPlayer.rounds.length - 1]
      play(lastRound.effectiveness > 1 ? 'crit' : lastRound.effectiveness < 1 ? 'weak' : 'hit')

      setState(settle(afterPlayer))
    },
    [finished, state, player, opponent, play, settle],
  )

  const currentRound = state.rounds.length > 0 ? state.rounds[state.rounds.length - 1] : null

  return {
    rounds: state.rounds,
    currentRound,
    hpA: state.hp[player.id],
    hpB: state.hp[opponent.id],
    finished,
    winnerId: state.winnerId,
    loserId: state.loserId,
    isPlayerTurn: !finished && state.attackerId === player.id,
    powers,
    choose,
    reset,
  }
}
