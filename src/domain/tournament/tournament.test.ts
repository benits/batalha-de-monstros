import { describe, expect, it } from 'vitest'
import {
  championId,
  createTournament,
  isTournamentOver,
  nextPlayableMatch,
  playMatch,
  roundLabel,
  totalRounds,
} from './tournament'
import type { Monster } from '@/domain/monster/monster.types'

const monster = (id: string, attack: number): Monster => ({
  id,
  name: id.toUpperCase(),
  attack,
  defense: 10,
  speed: attack, // mais forte também é mais rápido, para o resultado ser previsível
  hp: 60,
  imageUrl: '',
  element: 'fogo',
})

/** Força crescente: m4 vence todo mundo, m1 perde de todo mundo. */
const roster = [monster('m1', 20), monster('m2', 30), monster('m3', 40), monster('m4', 50)]
const byId = Object.fromEntries(roster.map((m) => [m.id, m]))

const playAll = (ids: string[] = roster.map((m) => m.id)) => {
  let tournament = createTournament(ids, 'classic')
  let guard = 0
  while (!isTournamentOver(tournament) && guard++ < 50) {
    const match = nextPlayableMatch(tournament)!
    tournament = playMatch(tournament, match.id, byId)
  }
  return tournament
}

describe('createTournament', () => {
  it('monta a primeira rodada com os participantes em pares', () => {
    const tournament = createTournament(['m1', 'm2', 'm3', 'm4'], 'classic')
    const first = tournament.matches.filter((match) => match.round === 0)

    expect(first).toHaveLength(2)
    expect(first[0]).toMatchObject({ aId: 'm1', bId: 'm2' })
    expect(first[1]).toMatchObject({ aId: 'm3', bId: 'm4' })
  })

  it('cria as rodadas seguintes vazias', () => {
    const tournament = createTournament(['m1', 'm2', 'm3', 'm4'], 'classic')
    const final = tournament.matches.filter((match) => match.round === 1)

    expect(final).toHaveLength(1)
    expect(final[0].aId).toBeUndefined()
    expect(final[0].bId).toBeUndefined()
  })

  it('aceita 8 participantes', () => {
    const ids = Array.from({ length: 8 }, (_, i) => `m${i}`)
    const tournament = createTournament(ids, 'classic')

    expect(totalRounds(tournament)).toBe(3)
    expect(tournament.matches).toHaveLength(7)
  })

  it('recusa quantidade que não é potência de dois', () => {
    expect(() => createTournament(['m1', 'm2', 'm3'], 'classic')).toThrow(/potência de dois/i)
    expect(() => createTournament(['m1'], 'classic')).toThrow()
  })

  it('recusa participante repetido', () => {
    expect(() => createTournament(['m1', 'm1', 'm2', 'm3'], 'classic')).toThrow(/repetido/i)
  })
})

describe('playMatch', () => {
  it('registra o vencedor e o número de rounds', () => {
    const tournament = createTournament(['m1', 'm2', 'm3', 'm4'], 'classic')
    const played = playMatch(tournament, tournament.matches[0].id, byId)
    const match = played.matches[0]

    expect(match.winnerId).toBe('m2')
    expect(match.roundCount).toBeGreaterThan(0)
  })

  it('promove o vencedor para o confronto seguinte', () => {
    const tournament = createTournament(['m1', 'm2', 'm3', 'm4'], 'classic')

    const afterFirst = playMatch(tournament, tournament.matches[0].id, byId)
    expect(afterFirst.matches[2].aId).toBe('m2')

    const afterSecond = playMatch(afterFirst, afterFirst.matches[1].id, byId)
    expect(afterSecond.matches[2].bId).toBe('m4')
  })

  it('não muda o torneio recebido', () => {
    const tournament = createTournament(['m1', 'm2', 'm3', 'm4'], 'classic')
    const snapshot = structuredClone(tournament)
    playMatch(tournament, tournament.matches[0].id, byId)
    expect(tournament).toEqual(snapshot)
  })

  it('recusa jogar um confronto sem os dois lados definidos', () => {
    const tournament = createTournament(['m1', 'm2', 'm3', 'm4'], 'classic')
    expect(() => playMatch(tournament, tournament.matches[2].id, byId)).toThrow(/incompleto/i)
  })

  it('recusa jogar duas vezes o mesmo confronto', () => {
    const tournament = createTournament(['m1', 'm2', 'm3', 'm4'], 'classic')
    const played = playMatch(tournament, tournament.matches[0].id, byId)
    expect(() => playMatch(played, played.matches[0].id, byId)).toThrow(/já foi/i)
  })
})

describe('nextPlayableMatch', () => {
  it('devolve os confrontos na ordem do bracket', () => {
    const tournament = createTournament(['m1', 'm2', 'm3', 'm4'], 'classic')
    expect(nextPlayableMatch(tournament)!.id).toBe(tournament.matches[0].id)

    const played = playMatch(tournament, tournament.matches[0].id, byId)
    expect(nextPlayableMatch(played)!.id).toBe(tournament.matches[1].id)
  })

  it('é nulo quando o torneio acaba', () => {
    expect(nextPlayableMatch(playAll())).toBeNull()
  })
})

describe('torneio completo', () => {
  it('o mais forte é campeão', () => {
    const finished = playAll()
    expect(isTournamentOver(finished)).toBe(true)
    expect(championId(finished)).toBe('m4')
  })

  it('todo confronto tem vencedor ao fim', () => {
    const finished = playAll()
    expect(finished.matches.every((match) => match.winnerId !== undefined)).toBe(true)
  })

  it('é determinístico', () => {
    expect(playAll()).toEqual(playAll())
  })

  it('não há campeão antes do fim', () => {
    const tournament = createTournament(['m1', 'm2', 'm3', 'm4'], 'classic')
    expect(championId(tournament)).toBeNull()
  })
})

describe('roundLabel', () => {
  it('nomeia as fases pelo tamanho do torneio', () => {
    const oito = createTournament(
      Array.from({ length: 8 }, (_, i) => `m${i}`),
      'classic',
    )
    expect(roundLabel(oito, 0)).toBe('Quartas')
    expect(roundLabel(oito, 1)).toBe('Semifinal')
    expect(roundLabel(oito, 2)).toBe('Final')

    const quatro = createTournament(['m1', 'm2', 'm3', 'm4'], 'classic')
    expect(roundLabel(quatro, 0)).toBe('Semifinal')
    expect(roundLabel(quatro, 1)).toBe('Final')
  })
})
