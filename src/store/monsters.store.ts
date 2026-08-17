import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Monster, MonsterDraft } from '@/domain/monster/monster.types'
import { SEED_MONSTERS } from './seed'

type MonstersState = {
  monsters: Monster[]
  createMonster: (draft: MonsterDraft) => Monster
  updateMonster: (id: string, draft: MonsterDraft) => void
  removeMonster: (id: string) => void
}

const newId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `m-${Date.now()}-${Math.floor(Math.random() * 1e6)}`

export const useMonstersStore = create<MonstersState>()(
  persist(
    (set) => ({
      monsters: SEED_MONSTERS,

      createMonster: (draft) => {
        const monster: Monster = { ...draft, id: newId() }
        set((state) => ({ monsters: [monster, ...state.monsters] }))
        return monster
      },

      updateMonster: (id, draft) =>
        set((state) => ({
          monsters: state.monsters.map((monster) =>
            monster.id === id ? { ...draft, id } : monster,
          ),
        })),

      removeMonster: (id) =>
        set((state) => ({ monsters: state.monsters.filter((monster) => monster.id !== id) })),
    }),
    { name: 'revi:monsters' },
  ),
)
