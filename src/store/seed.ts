import type { Monster } from '@/domain/monster/monster.types'
import { presetUrl } from '@/lib/sprite/presets'

/**
 * Roster da primeira visita — o app nunca abre vazio.
 *
 * Duas escolhas deliberadas: os atributos cobrem uma faixa larga de nível, para
 * que os três tiers de poder apareçam já na primeira batalha; e metade dos
 * monstros vem com `imageUrl` preenchida (sprite CC0) e metade em branco, para
 * as duas camadas de sprite ficarem visíveis lado a lado.
 */
export const SEED_MONSTERS: Monster[] = [
  {
    id: 'seed-lodo',
    name: 'Lodo Ácido',
    attack: 22,
    defense: 16,
    speed: 14,
    hp: 62,
    imageUrl: presetUrl('planta-lodo-acido.png'),
    element: 'planta',
  },
  {
    id: 'seed-morcego',
    name: 'Morcego Espectral',
    attack: 32,
    defense: 14,
    speed: 46,
    hp: 66,
    imageUrl: '',
    element: 'eletrico',
  },
  {
    id: 'seed-corvo',
    name: 'Corvo do Abismo',
    attack: 38,
    defense: 12,
    speed: 52,
    hp: 58,
    imageUrl: presetUrl('eletrico-esfera.png'),
    element: 'eletrico',
  },
  {
    id: 'seed-verme',
    name: 'Verme Ígneo',
    attack: 46,
    defense: 18,
    speed: 28,
    hp: 84,
    imageUrl: presetUrl('fogo-serpente-de-lava.png'),
    element: 'fogo',
  },
  {
    id: 'seed-sentinela',
    name: 'Sentinela de Cristal',
    attack: 36,
    defense: 34,
    speed: 16,
    hp: 118,
    imageUrl: '',
    element: 'agua',
  },
  {
    id: 'seed-golem',
    name: 'Golem de Basalto',
    attack: 48,
    defense: 30,
    speed: 12,
    hp: 134,
    imageUrl: presetUrl('terra-elemental.png'),
    element: 'terra',
  },
]
