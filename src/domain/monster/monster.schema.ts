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

/** Caminho servido pelo próprio app, como os presets em `public/sprites/`. */
const IMAGE_PATH = /^\/[^\s?#]+\.(png|jpe?g|gif|webp|svg|avif)$/i

/**
 * `image_url` aceita quatro formas: vazia, URL absoluta, data URI (o que o
 * sprite procedural produz) e caminho relativo de imagem servida pelo app.
 */
const isImageSource = (value: string) =>
  value === '' || IMAGE_PATH.test(value) || URL.canParse(value)

export const monsterDraftSchema = z.object({
  name: z.string().trim().min(1, 'Dê um nome ao monstro').max(40, 'Nome muito longo'),
  attack: stat('Ataque', MAX_STAT),
  defense: stat('Defesa', MAX_STAT),
  speed: stat('Velocidade', MAX_STAT),
  hp: stat('HP', MAX_HP),
  imageUrl: z
    .string()
    .refine(isImageSource, 'Informe uma URL de imagem válida, ou deixe em branco'),
  element: z.enum(ELEMENT_CYCLE, { message: 'Escolha um elemento' }),
})

export type MonsterDraftInput = z.infer<typeof monsterDraftSchema>
