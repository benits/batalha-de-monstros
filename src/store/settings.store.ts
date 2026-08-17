import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DamageMode } from '@/domain/battle/battle.types'

export type ReplaySpeed = 1 | 2 | 4

/**
 * O modo que o jogador escolhe na tela. `classic` e `arena` resolvem a batalha
 * de uma vez, como o enunciado exige; `duel` é o modo por turno, explicitamente
 * fora do enunciado.
 */
export type BattleMode = 'classic' | 'arena' | 'duel'

export const BATTLE_MODES: BattleMode[] = ['classic', 'arena', 'duel']

export const BATTLE_MODE_LABEL: Record<BattleMode, string> = {
  classic: 'Clássico',
  arena: 'Arena',
  duel: 'Duelo por turno',
}

export const BATTLE_MODE_HINT: Record<BattleMode, string> = {
  classic:
    'Clássico: dano = ataque − defesa, mínimo 1. A fórmula do enunciado, sem nenhuma adição. Todos os rounds são calculados de uma vez.',
  arena:
    'Arena: o dano clássico passa pelo poder do round e pela vantagem elemental. Ainda calculado de uma vez.',
  duel: 'Duelo: você escolhe o poder a cada turno e a CPU responde. Fora do enunciado, que pede a batalha calculada de uma vez.',
}

/** O motor só conhece duas regras de dano; o duelo usa a da Arena. */
export const damageModeOf = (mode: BattleMode): DamageMode =>
  mode === 'classic' ? 'classic' : 'arena'

export const isInteractive = (mode: BattleMode): boolean => mode === 'duel'

type SettingsState = {
  /** 'classic' é o default: a fórmula exata do enunciado. */
  mode: BattleMode
  muted: boolean
  speed: ReplaySpeed
  setMode: (mode: BattleMode) => void
  cycleMode: () => void
  toggleMuted: () => void
  cycleSpeed: () => void
}

const NEXT_SPEED: Record<ReplaySpeed, ReplaySpeed> = { 1: 2, 2: 4, 4: 1 }

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      mode: 'classic',
      muted: false,
      speed: 1,
      setMode: (mode) => set({ mode }),
      cycleMode: () =>
        set((state) => ({
          mode: BATTLE_MODES[(BATTLE_MODES.indexOf(state.mode) + 1) % BATTLE_MODES.length],
        })),
      toggleMuted: () => set((state) => ({ muted: !state.muted })),
      cycleSpeed: () => set((state) => ({ speed: NEXT_SPEED[state.speed] })),
    }),
    { name: 'revi:settings' },
  ),
)
