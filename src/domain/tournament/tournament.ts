import type { Monster } from '@/domain/monster/monster.types'
import { simulateBattle } from '@/domain/battle/battle.engine'
import type { DamageMode } from '@/domain/battle/battle.types'

export type TournamentMatch = {
  id: string
  /** 0 é a primeira rodada; a última é a final. */
  round: number
  slot: number
  aId?: string
  bId?: string
  winnerId?: string
  loserId?: string
  /** Quantos rounds a batalha levou — o bracket mostra isso. */
  roundCount?: number
}

export type Tournament = {
  size: number
  mode: DamageMode
  matches: TournamentMatch[]
}

const isPowerOfTwo = (value: number) => value >= 2 && (value & (value - 1)) === 0

export const totalRounds = (tournament: Tournament): number => Math.log2(tournament.size)

/**
 * Bracket de eliminação simples. O vencedor de `(round, slot)` cai em
 * `(round + 1, floor(slot / 2))`, no lado A se o slot for par e no B se ímpar —
 * a mesma aritmética que desenha a chave na tela.
 */
export const createTournament = (participantIds: string[], mode: DamageMode): Tournament => {
  if (!isPowerOfTwo(participantIds.length)) {
    throw new Error('Um torneio precisa de uma quantidade de participantes que seja potência de dois')
  }
  if (new Set(participantIds).size !== participantIds.length) {
    throw new Error('Um participante repetido não pode entrar duas vezes no torneio')
  }

  const size = participantIds.length
  const rounds = Math.log2(size)
  const matches: TournamentMatch[] = []

  for (let round = 0; round < rounds; round += 1) {
    const slots = size / 2 ** (round + 1)
    for (let slot = 0; slot < slots; slot += 1) {
      matches.push({
        id: `r${round}s${slot}`,
        round,
        slot,
        aId: round === 0 ? participantIds[slot * 2] : undefined,
        bId: round === 0 ? participantIds[slot * 2 + 1] : undefined,
      })
    }
  }

  return { size, mode, matches }
}

export const nextPlayableMatch = (tournament: Tournament): TournamentMatch | null =>
  tournament.matches.find(
    (match) => match.winnerId === undefined && match.aId !== undefined && match.bId !== undefined,
  ) ?? null

export const isTournamentOver = (tournament: Tournament): boolean =>
  tournament.matches.every((match) => match.winnerId !== undefined)

export const finalMatch = (tournament: Tournament): TournamentMatch =>
  tournament.matches[tournament.matches.length - 1]

export const championId = (tournament: Tournament): string | null =>
  finalMatch(tournament).winnerId ?? null

const ROUND_NAMES = ['Final', 'Semifinal', 'Quartas', 'Oitavas']

export const roundLabel = (tournament: Tournament, round: number): string => {
  const fromEnd = totalRounds(tournament) - 1 - round
  return ROUND_NAMES[fromEnd] ?? `Rodada ${round + 1}`
}

/** Simula um confronto e promove o vencedor para a chave seguinte. */
export const playMatch = (
  tournament: Tournament,
  matchId: string,
  monsters: Record<string, Monster>,
): Tournament => {
  const match = tournament.matches.find((entry) => entry.id === matchId)
  if (!match) throw new Error(`Confronto ${matchId} não existe neste torneio`)
  if (match.winnerId !== undefined) throw new Error(`O confronto ${matchId} já foi disputado`)
  if (!match.aId || !match.bId) throw new Error(`O confronto ${matchId} está incompleto`)

  const result = simulateBattle(monsters[match.aId], monsters[match.bId], tournament.mode)

  const played: TournamentMatch = {
    ...match,
    winnerId: result.winnerId,
    loserId: result.loserId,
    roundCount: result.rounds.length,
  }

  const nextId = `r${match.round + 1}s${Math.floor(match.slot / 2)}`
  const goesToSideA = match.slot % 2 === 0

  return {
    ...tournament,
    matches: tournament.matches.map((entry) => {
      if (entry.id === match.id) return played
      if (entry.id !== nextId) return entry
      return goesToSideA
        ? { ...entry, aId: result.winnerId }
        : { ...entry, bId: result.winnerId }
    }),
  }
}
