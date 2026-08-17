import type { Element } from '@/domain/monster/monster.types'
import { ELEMENTS } from '@/domain/powers/elements'

const GRID = 12
const CENTER = GRID / 2 // primeira coluna à direita do eixo de espelhamento

const hashSeed = (value: string): number => {
  let hash = 2166136261 >>> 0
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

/** mulberry32 — PRNG pequeno e determinístico. */
const createRandom = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

/** Clareia ou escurece um hex `#RRGGBB` por um fator. Usado para o sombreado. */
const shade = (hex: string, factor: number): string => {
  const channel = (offset: number) => {
    const value = parseInt(hex.slice(offset, offset + 2), 16)
    const next = Math.round(factor < 1 ? value * factor : value + (255 - value) * (factor - 1))
    return clamp(next, 0, 255).toString(16).padStart(2, '0')
  }
  return `#${channel(1)}${channel(3)}${channel(5)}`
}

const rect = (x: number, y: number, w: number, h: number, fill: string) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"/>`

type Grid = number[][]

const fillMirrored = (grid: Grid, y: number, x: number) => {
  if (y < 0 || y >= GRID || x < 0 || x >= GRID) return
  grid[y][x] = 1
  grid[y][GRID - 1 - x] = 1
}

/**
 * Constrói a silhueta como um passeio aleatório da meia-largura, linha a linha.
 * É isso que faz cada monstro ter corpo próprio em vez de todos virarem o mesmo bloco.
 */
const buildBody = (random: () => number) => {
  const top = 1 + Math.floor(random() * 2) // 1..2
  const bottom = GRID - 3 + Math.floor(random() * 2) // 9..10
  const grid: Grid = Array.from({ length: GRID }, () => Array<number>(GRID).fill(0))

  let halfWidth = 2 + Math.floor(random() * 3) // 2..4
  const halfWidths: number[] = []

  for (let y = top; y <= bottom; y += 1) {
    if (random() < 0.6) {
      halfWidth = clamp(halfWidth + (random() < 0.5 ? -1 : 1), 2, CENTER)
    }
    halfWidths[y] = halfWidth
    for (let x = CENTER - halfWidth; x < CENTER; x += 1) fillMirrored(grid, y, x)
  }

  // Chifres ou antenas acima da cabeça.
  if (random() < 0.6) {
    const hornInset = 1 + Math.floor(random() * 2)
    fillMirrored(grid, top - 1, CENTER - halfWidths[top] + hornInset)
  }

  // Patas: duas colunas separadas, uma linha abaixo do corpo.
  if (random() < 0.7) {
    const legInset = CENTER - halfWidths[bottom]
    fillMirrored(grid, bottom + 1, legInset)
    fillMirrored(grid, bottom + 1, legInset + 1)
  }

  // Braços: um pixel para fora, na altura do meio do corpo.
  if (random() < 0.55) {
    const armRow = Math.floor((top + bottom) / 2)
    fillMirrored(grid, armRow, CENTER - halfWidths[armRow] - 1)
  }

  return { grid, top, bottom, halfWidths }
}

/**
 * Sprite pixel art gerado a partir do nome e do elemento: silhueta simétrica,
 * contorno, sombreado e olhos. Mesmo nome e mesmo elemento produzem sempre o
 * mesmo monstro.
 */
export const generateSpriteSvg = (seed: string, element: Element): string => {
  const base = ELEMENTS[element].color
  const palette = {
    base,
    light: shade(base, 1.35),
    dark: shade(base, 0.55),
    line: shade(base, 0.18),
  }

  const random = createRandom(hashSeed(`${seed}:${element}`))
  const { grid, top, bottom, halfWidths } = buildBody(random)

  const pixels: string[] = []

  // Contorno: toda célula vazia encostada no corpo.
  for (let y = 0; y < GRID; y += 1) {
    for (let x = 0; x < GRID; x += 1) {
      if (grid[y][x]) continue
      const touchesBody = grid[y - 1]?.[x] || grid[y + 1]?.[x] || grid[y][x - 1] || grid[y][x + 1]
      if (touchesBody) pixels.push(rect(x, y, 1, 1, palette.line))
    }
  }

  // Corpo, sombreado por linha.
  const shadeStart = top + 1
  const shadeEnd = bottom - 1
  for (let y = 0; y < GRID; y += 1) {
    for (let x = 0; x < GRID; x += 1) {
      if (!grid[y][x]) continue
      const fill = y <= shadeStart ? palette.light : y >= shadeEnd ? palette.dark : palette.base
      pixels.push(rect(x, y, 1, 1, fill))
    }
  }

  // Olhos, sempre dentro do corpo e legíveis.
  const eyeRow = clamp(top + 1 + Math.floor(random() * 2), top, bottom - 1)
  const eyeHalfWidth = halfWidths[eyeRow] ?? 3
  const big = eyeHalfWidth >= 4
  const eyeSize = big ? 2 : 1
  const leftEye = CENTER - eyeHalfWidth + 1
  const rightEye = GRID - leftEye - eyeSize

  for (const x of [leftEye, rightEye]) {
    pixels.push(rect(x, eyeRow, eyeSize, eyeSize, '#F7F4FF'))
    pixels.push(rect(x + (big ? 1 : 0), eyeRow + (big ? 1 : 0), 1, 1, palette.line))
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${GRID} ${GRID}" shape-rendering="crispEdges">${pixels.join('')}</svg>`
}

/** Pronto para `<img src>`: nenhum markup é injetado na árvore React. */
export const generateSpriteDataUri = (seed: string, element: Element): string =>
  `data:image/svg+xml,${encodeURIComponent(generateSpriteSvg(seed, element))}`
