import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { BattleMode } from './settings.store'

export type BattleRecord = {
  id: string
  foughtAt: string
  mode: BattleMode
  winnerName: string
  loserName: string
  rounds: number
}

const HISTORY_LIMIT = 20

type BattlesState = {
  history: BattleRecord[]
  recordBattle: (entry: Omit<BattleRecord, 'id' | 'foughtAt'>) => void
  clearHistory: () => void
}

export const useBattlesStore = create<BattlesState>()(
  persist(
    (set) => ({
      history: [],

      recordBattle: (entry) =>
        set((state) => ({
          history: [
            { ...entry, id: `b-${Date.now()}`, foughtAt: new Date().toISOString() },
            ...state.history,
          ].slice(0, HISTORY_LIMIT),
        })),

      clearHistory: () => set({ history: [] }),
    }),
    { name: 'revi:battles' },
  ),
)
