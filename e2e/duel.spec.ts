import { expect, test } from '@playwright/test'
import { createMonster, goToTab, openApp, pickFighters } from './fixtures'

test.beforeEach(async ({ page }) => openApp(page))

/** Nível 8+ para ter os três golpes e a escolha fazer sentido. */
const createVeteran = (page: Parameters<typeof goToTab>[0], name: string, speed: number) =>
  createMonster(page, { name, attack: 55, defense: 25, speed, hp: 120, element: 'Fogo' })

const openDuel = async (page: Parameters<typeof goToTab>[0]) => {
  await goToTab(page, /Seleção/)
  await page.getByRole('button', { name: 'Duelo por turno' }).click()
  await goToTab(page, /Arena/)
}

test('os três modos ficam visíveis na seleção', async ({ page }) => {
  await goToTab(page, /Seleção/)

  for (const label of ['Clássico', 'Arena', 'Duelo por turno']) {
    await expect(page.getByRole('button', { name: label, exact: true })).toBeVisible()
  }
  await expect(page.getByRole('button', { name: 'Clássico', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
})

test('a dica muda conforme o modo escolhido', async ({ page }) => {
  await goToTab(page, /Seleção/)
  const hint = page.getByTestId('mode-hint')

  await expect(hint).toContainText('dano = ataque − defesa')
  await page.getByRole('button', { name: 'Duelo por turno' }).click()
  await expect(hint).toContainText('você escolhe o poder a cada turno')
})

test('no duelo o jogador escolhe o golpe e a CPU responde', async ({ page }) => {
  await createVeteran(page, 'Campeao', 60)
  await createVeteran(page, 'Rival', 10)

  await goToTab(page, /Seleção/)
  await pickFighters(page, 'Campeao', 'Rival')
  await page.getByRole('button', { name: 'Duelo por turno' }).click()
  await goToTab(page, /Arena/)

  await expect(page.getByRole('heading', { name: 'Duelo por turno' })).toBeVisible()
  await expect(page.getByTestId('log-line')).toHaveCount(0)

  // Campeao tem velocidade maior, então a vez começa com o jogador.
  const inferno = page.getByRole('button', { name: /Inferno/ })
  await expect(inferno).toBeEnabled()
  await inferno.click()

  // Um round do jogador e um da CPU.
  await expect(page.getByTestId('log-line')).toHaveCount(2)
  await expect(page.getByTestId('log-line').first()).toContainText('Inferno')
  await expect(page.getByTestId('log-line').first()).toHaveAttribute('data-attacker', 'Campeao')
  await expect(page.getByTestId('log-line').nth(1)).toHaveAttribute('data-attacker', 'Rival')
})

test('o golpe escolhido é o que entra no log', async ({ page }) => {
  await createVeteran(page, 'Campeao', 60)
  await createVeteran(page, 'Rival', 10)

  await goToTab(page, /Seleção/)
  await pickFighters(page, 'Campeao', 'Rival')
  await page.getByRole('button', { name: 'Duelo por turno' }).click()
  await goToTab(page, /Arena/)

  await page.getByRole('button', { name: /Brasa/ }).click()
  await expect(page.getByTestId('log-line').first()).toContainText('Brasa')

  await page.getByRole('button', { name: /Labareda/ }).click()
  await expect(page.getByTestId('log-line').nth(2)).toContainText('Labareda')
})

test('o duelo termina com banner e entra no histórico', async ({ page }) => {
  await createVeteran(page, 'Bruto', 60)
  await createMonster(page, {
    name: 'Frangote',
    attack: 5,
    defense: 1,
    speed: 1,
    hp: 12,
    element: 'Planta',
  })

  await goToTab(page, /Seleção/)
  await pickFighters(page, 'Bruto', 'Frangote')
  await page.getByRole('button', { name: 'Duelo por turno' }).click()
  await goToTab(page, /Arena/)

  await page.getByRole('button', { name: /Inferno/ }).click()

  const banner = page.getByTestId('winner-banner')
  await expect(banner).toBeVisible()
  await expect(banner).toHaveAttribute('data-winner', 'Bruto')

  await goToTab(page, /Histórico/)
  await expect(page.getByRole('listitem').first()).toContainText('modo duelo por turno')
})

test('recomeçar zera o duelo', async ({ page }) => {
  await createVeteran(page, 'Campeao', 60)
  await createVeteran(page, 'Rival', 10)

  await goToTab(page, /Seleção/)
  await pickFighters(page, 'Campeao', 'Rival')
  await page.getByRole('button', { name: 'Duelo por turno' }).click()
  await goToTab(page, /Arena/)

  await page.getByRole('button', { name: /Brasa/ }).click()
  await expect(page.getByTestId('log-line')).toHaveCount(2)

  await page.getByRole('button', { name: /Recomeçar/ }).click()
  await expect(page.getByTestId('log-line')).toHaveCount(0)
})

test('monstro de nível baixo avisa que só tem um golpe', async ({ page }) => {
  await openDuel(page)
  await expect(page.getByText(/só destravou um golpe/)).toBeVisible()
})
