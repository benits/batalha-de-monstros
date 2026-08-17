import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { simulateBattle } from './battle.engine'
import { resolveFirstAttacker } from './turn-order'
import { MAX_HP, MAX_STAT } from '@/domain/monster/monster.schema'
import { ELEMENT_CYCLE, type Monster } from '@/domain/monster/monster.types'

/**
 * Um exemplo escrito à mão nunca encontra o par de monstros com defesa 99 e
 * ataque 1. Estas propriedades valem para qualquer entrada que o formulário
 * aceita, então os geradores usam exatamente os limites do schema.
 */
const arbMonster = (id: string) =>
  fc.record({
    id: fc.constant(id),
    name: fc.constant(id),
    attack: fc.integer({ min: 1, max: MAX_STAT }),
    defense: fc.integer({ min: 1, max: MAX_STAT }),
    speed: fc.integer({ min: 1, max: MAX_STAT }),
    hp: fc.integer({ min: 1, max: MAX_HP }),
    imageUrl: fc.constant(''),
    element: fc.constantFrom(...ELEMENT_CYCLE),
  }) as fc.Arbitrary<Monster>

const arbPair = fc.tuple(arbMonster('a'), arbMonster('b'))
const arbMode = fc.constantFrom('classic' as const, 'arena' as const)

const RUNS = { numRuns: 2000 }

describe('simulateBattle — propriedades', () => {
  it('sempre termina, e o vencedor é sempre um dos dois', () => {
    fc.assert(
      fc.property(arbPair, arbMode, ([a, b], mode) => {
        const result = simulateBattle(a, b, mode)
        expect(result.rounds.length).toBeGreaterThan(0)
        expect([a.id, b.id]).toContain(result.winnerId)
        expect(result.winnerId).not.toBe(result.loserId)
      }),
      RUNS,
    )
  })

  it('o dano é sempre um inteiro de no mínimo 1', () => {
    fc.assert(
      fc.property(arbPair, arbMode, ([a, b], mode) => {
        for (const round of simulateBattle(a, b, mode).rounds) {
          expect(Number.isInteger(round.damage)).toBe(true)
          expect(round.damage).toBeGreaterThanOrEqual(1)
        }
      }),
      RUNS,
    )
  })

  it('o hp nunca fica negativo, e nunca sobe', () => {
    fc.assert(
      fc.property(arbPair, arbMode, ([a, b], mode) => {
        const result = simulateBattle(a, b, mode)
        let previousA = a.hp
        let previousB = b.hp

        for (const round of result.rounds) {
          expect(round.hpA).toBeGreaterThanOrEqual(0)
          expect(round.hpB).toBeGreaterThanOrEqual(0)
          expect(round.hpA).toBeLessThanOrEqual(previousA)
          expect(round.hpB).toBeLessThanOrEqual(previousB)
          previousA = round.hpA
          previousB = round.hpB
        }
      }),
      RUNS,
    )
  })

  it('exatamente um lado chega a zero, e é o do perdedor', () => {
    fc.assert(
      fc.property(arbPair, arbMode, ([a, b], mode) => {
        const result = simulateBattle(a, b, mode)
        const last = result.rounds[result.rounds.length - 1]
        const loserHp = result.loserId === a.id ? last.hpA : last.hpB
        const winnerHp = result.winnerId === a.id ? last.hpA : last.hpB

        expect(loserHp).toBe(0)
        expect(winnerHp).toBeGreaterThan(0)
      }),
      RUNS,
    )
  })

  it('quem desfere o último golpe é o vencedor', () => {
    fc.assert(
      fc.property(arbPair, arbMode, ([a, b], mode) => {
        const result = simulateBattle(a, b, mode)
        expect(result.rounds[result.rounds.length - 1].attackerId).toBe(result.winnerId)
      }),
      RUNS,
    )
  })

  it('os rounds alternam de atacante, sem dois golpes seguidos do mesmo lado', () => {
    fc.assert(
      fc.property(arbPair, arbMode, ([a, b], mode) => {
        const attackers = simulateBattle(a, b, mode).rounds.map((round) => round.attackerId)
        for (let index = 1; index < attackers.length; index += 1) {
          expect(attackers[index]).not.toBe(attackers[index - 1])
        }
      }),
      RUNS,
    )
  })

  it('o primeiro atacante é o que a regra de ordem escolhe, e ele abre o round 1', () => {
    fc.assert(
      fc.property(arbPair, arbMode, ([a, b], mode) => {
        const result = simulateBattle(a, b, mode)
        expect(result.firstAttackerId).toBe(resolveFirstAttacker(a, b).first.id)
        expect(result.rounds[0].attackerId).toBe(result.firstAttackerId)
      }),
      RUNS,
    )
  })

  it('é determinístico: mesma entrada, resultado idêntico', () => {
    fc.assert(
      fc.property(arbPair, arbMode, ([a, b], mode) => {
        expect(simulateBattle(a, b, mode)).toEqual(simulateBattle(a, b, mode))
      }),
      RUNS,
    )
  })

  it('a ordem dos argumentos não muda quem vence', () => {
    fc.assert(
      fc.property(arbPair, arbMode, ([a, b], mode) => {
        expect(simulateBattle(a, b, mode).winnerId).toBe(simulateBattle(b, a, mode).winnerId)
      }),
      RUNS,
    )
  })
})

describe('modo clássico — a fórmula do enunciado, para qualquer entrada', () => {
  it('todo round causa exatamente max(1, ataque - defesa) do atacante', () => {
    fc.assert(
      fc.property(arbPair, ([a, b]) => {
        const byId = { [a.id]: a, [b.id]: b }
        for (const round of simulateBattle(a, b).rounds) {
          const attacker = byId[round.attackerId]
          const defender = byId[round.defenderId]
          expect(round.damage).toBe(Math.max(1, attacker.attack - defender.defense))
        }
      }),
      RUNS,
    )
  })

  it('nunca aplica multiplicador de elemento', () => {
    fc.assert(
      fc.property(arbPair, ([a, b]) => {
        const rounds = simulateBattle(a, b).rounds
        expect(rounds.every((round) => round.effectiveness === 1)).toBe(true)
        expect(rounds.every((round) => round.powerId === undefined)).toBe(true)
      }),
      RUNS,
    )
  })
})

describe('modo arena — nunca contradiz o piso do enunciado', () => {
  it('o dano com poder e elemento continua sendo no mínimo 1', () => {
    fc.assert(
      fc.property(arbPair, ([a, b]) => {
        const rounds = simulateBattle(a, b, 'arena').rounds
        expect(rounds.every((round) => round.damage >= 1)).toBe(true)
        expect(rounds.every((round) => round.powerId !== undefined)).toBe(true)
      }),
      RUNS,
    )
  })

  it('a efetividade é sempre um dos três valores do ciclo', () => {
    fc.assert(
      fc.property(arbPair, ([a, b]) => {
        for (const round of simulateBattle(a, b, 'arena').rounds) {
          expect([0.75, 1, 1.5]).toContain(round.effectiveness)
        }
      }),
      RUNS,
    )
  })
})
