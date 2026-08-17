import { useState } from 'react'
import type { Monster, MonsterDraft } from '@/domain/monster/monster.types'
import { useMonstersStore } from '@/store/monsters.store'
import { useSfx } from '@/lib/audio/useSfx'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { MonsterCard } from './MonsterCard'
import { MonsterForm } from './MonsterForm'

export const RosterScreen = () => {
  const monsters = useMonstersStore((state) => state.monsters)
  const createMonster = useMonstersStore((state) => state.createMonster)
  const updateMonster = useMonstersStore((state) => state.updateMonster)
  const removeMonster = useMonstersStore((state) => state.removeMonster)
  const play = useSfx()

  const [editing, setEditing] = useState<Monster | null>(null)
  const [pendingRemoval, setPendingRemoval] = useState<Monster | null>(null)

  const submit = (draft: MonsterDraft) => {
    if (editing) {
      updateMonster(editing.id, draft)
      setEditing(null)
    } else {
      createMonster(draft)
    }
    play('select')
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div>
        <header className="mb-4 flex items-baseline gap-3">
          <h2 className="text-[15px] font-bold tracking-[0.2em] uppercase">Meus monstros</h2>
          <span className="text-dim text-[10px] tracking-[0.2em] tabular-nums uppercase">
            {monsters.length} cadastrados
          </span>
        </header>

        {monsters.length === 0 ? (
          <p className="text-dim text-[13px]">
            Nenhum monstro ainda. Use o formulário ao lado para criar o primeiro.
          </p>
        ) : (
          <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(200px,1fr))]">
            {monsters.map((monster) => (
              <MonsterCard
                key={monster.id}
                monster={monster}
                onEdit={setEditing}
                onRemove={setPendingRemoval}
              />
            ))}
          </div>
        )}
      </div>

      <MonsterForm
        key={editing?.id ?? 'new'}
        editing={editing ?? undefined}
        onSubmit={submit}
        onCancel={editing ? () => setEditing(null) : undefined}
      />

      <Modal
        open={pendingRemoval !== null}
        title="Excluir monstro"
        onClose={() => setPendingRemoval(null)}
      >
        <p className="text-dim mb-4 text-[13px]">
          Excluir <strong className="text-paper">{pendingRemoval?.name}</strong> do roster? Não dá
          para desfazer.
        </p>
        <div className="flex gap-2">
          <Button
            variant="danger"
            onClick={() => {
              if (pendingRemoval) removeMonster(pendingRemoval.id)
              setPendingRemoval(null)
            }}
          >
            Excluir
          </Button>
          <Button variant="ghost" onClick={() => setPendingRemoval(null)}>
            Cancelar
          </Button>
        </div>
      </Modal>
    </section>
  )
}
