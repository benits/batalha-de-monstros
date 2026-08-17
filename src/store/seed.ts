import type { Monster } from '@/domain/monster/monster.types'

/**
 * Roster da primeira visita — o app nunca abre vazio.
 * Os atributos cobrem de propósito uma faixa larga de nível, para que os três
 * tiers de poder apareçam já na primeira batalha.
 */
export const SEED_MONSTERS: Monster[] = [
  { id: 'seed-lodo', name: 'Lodo Ácido', attack: 22, defense: 16, speed: 14, hp: 62, imageUrl: '', element: 'planta' },
  { id: 'seed-morcego', name: 'Morcego Espectral', attack: 32, defense: 14, speed: 46, hp: 66, imageUrl: '', element: 'eletrico' },
  { id: 'seed-corvo', name: 'Corvo do Abismo', attack: 38, defense: 12, speed: 52, hp: 58, imageUrl: '', element: 'eletrico' },
  { id: 'seed-verme', name: 'Verme Ígneo', attack: 46, defense: 18, speed: 28, hp: 84, imageUrl: '', element: 'fogo' },
  { id: 'seed-sentinela', name: 'Sentinela de Cristal', attack: 36, defense: 34, speed: 16, hp: 118, imageUrl: '', element: 'agua' },
  { id: 'seed-golem', name: 'Golem de Basalto', attack: 48, defense: 30, speed: 12, hp: 134, imageUrl: '', element: 'terra' },
]
