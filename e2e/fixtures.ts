import type { Page } from '@playwright/test'

export type MonsterInput = {
  name: string
  attack: number
  defense: number
  speed: number
  hp: number
  element?: string
}

/** Cada teste começa com o roster no estado inicial, sem herdar o anterior. */
export const openApp = async (page: Page) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await page.getByRole('tab', { name: /Roster/ }).waitFor()
}

export const goToTab = (page: Page, name: RegExp) =>
  page.getByRole('tab', { name }).click()

/** Cadastra pelo formulário real, não injetando estado — é o fluxo do usuário. */
export const createMonster = async (page: Page, monster: MonsterInput) => {
  await page.getByLabel('Nome').fill(monster.name)
  await page.getByLabel('Ataque').fill(String(monster.attack))
  await page.getByLabel('Defesa').fill(String(monster.defense))
  await page.getByLabel('Velocidade').fill(String(monster.speed))
  await page.getByLabel('HP', { exact: true }).fill(String(monster.hp))
  if (monster.element) {
    await page.getByLabel('Elemento').selectOption({ label: monster.element })
  }
  await page.getByRole('button', { name: 'Salvar monstro' }).click()
  await card(page, monster.name).waitFor()
}

export const card = (page: Page, name: string) =>
  page.getByRole('article').filter({ hasText: name })

/** Os chips da seleção mostram só a primeira palavra do nome. */
export const pickFighters = async (page: Page, challenger: string, opponent: string) => {
  const slots = page.getByRole('button', { name: challenger.split(' ')[0], exact: true })
  await slots.first().click()
  const opponentChips = page.getByRole('button', { name: opponent.split(' ')[0], exact: true })
  await opponentChips.nth(1).click()
}

export type BattleModeLabel = 'Clássico' | 'Arena' | 'Duelo por turno'

/** O seletor de modo mostra os três de uma vez; basta clicar no desejado. */
export const setMode = async (page: Page, mode: BattleModeLabel) => {
  const option = page.getByRole('button', { name: mode, exact: true })
  await option.click()
  await option.and(page.locator('[aria-pressed="true"]')).waitFor()
}
