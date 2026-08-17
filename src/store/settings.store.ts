import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DamageMode } from '@/domain/battle/battle.types'

export type ReplaySpeed = 1 | 2 | 4

type SettingsState = {
  /** 'classic' é o default: a fórmula exata do enunciado. */
  mode: DamageMode
  muted: boolean
  speed: ReplaySpeed
  setMode: (mode: DamageMode) => void
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
      toggleMuted: () => set((state) => ({ muted: !state.muted })),
      cycleSpeed: () => set((state) => ({ speed: NEXT_SPEED[state.speed] })),
    }),
    { name: 'revi:settings' },
  ),
)
