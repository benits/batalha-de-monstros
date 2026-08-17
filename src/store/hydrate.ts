import { monsterSchema } from '@/domain/monster/monster.schema'
import type { Monster } from '@/domain/monster/monster.types'
import { SEED_MONSTERS } from './seed'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

/**
 * `localStorage` é entrada não confiável: o usuário pode editar a chave na mão e
 * uma versão futura pode ter mudado o formato. Aqui o estado salvo passa pelo
 * mesmo schema do cadastro.
 *
 * A distinção que importa: estado ilegível volta ao roster inicial, mas um
 * roster legitimamente vazio é respeitado — quem apagou todos os monstros não
 * quer vê-los de volta no refresh.
 */
export const safeMonsters = (persisted: unknown): Monster[] => {
  if (!isRecord(persisted) || !Array.isArray(persisted.monsters)) return SEED_MONSTERS

  return persisted.monsters.flatMap((candidate) => {
    const result = monsterSchema.safeParse(candidate)
    return result.success ? [result.data] : []
  })
}
