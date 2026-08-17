import { z } from 'zod'
import { ELEMENT_CYCLE } from './monster.types'

export const MAX_STAT = 100
export const MAX_HP = 300

const stat = (label: string, max: number) =>
  z
    .number({ message: `${label} é obrigatório` })
    .int(`${label} deve ser um número inteiro`)
    .min(1, `${label} deve ser ao menos 1`)
    .max(max, `${label} não pode passar de ${max}`)

export const monsterDraftSchema = z.object({
  name: z.string().trim().min(1, 'Dê um nome ao monstro').max(40, 'Nome muito longo'),
  attack: stat('Ataque', MAX_STAT),
  defense: stat('Defesa', MAX_STAT),
  speed: stat('Velocidade', MAX_STAT),
  hp: stat('HP', MAX_HP),
  imageUrl: z.union([z.literal(''), z.url('Informe uma URL válida')]),
  element: z.enum(ELEMENT_CYCLE, { message: 'Escolha um elemento' }),
})

export type MonsterDraftInput = z.infer<typeof monsterDraftSchema>
