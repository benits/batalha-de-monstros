import { expect, test } from '@playwright/test'
import { goToTab, openApp, pickFighters, setMode } from './fixtures'

test.beforeEach(async ({ page }) => openApp(page))

test('a batalha anima, e o vencedor do banner é quem desfere o último golpe', async ({ page }) => {
  await goToTab(page, /Seleção/)
  await setMode(page, 'Clássico')
  await goToTab(page, /Arena/)

  await page.getByRole('button', { name: /Velocidade/ }).click() // 2×
  await page.getByRole('button', { name: /Velocidade/ }).click() // 4×
  await page.getByRole('button', { name: /Iniciar batalha/ }).click()

  const banner = page.getByTestId('winner-banner')
  await expect(banner).toBeVisible({ timeout: 30_000 })

  const lines = page.getByTestId('log-line')
  const lastAttacker = await lines.last().getAttribute('data-attacker')
  expect(await banner.getAttribute('data-winner')).toBe(lastAttacker)

  // O contador de rounds do banner bate com o log — as duas leituras vêm do mesmo array.
  expect(await banner.getAttribute('data-rounds')).toBe(String(await lines.count()))
})

test('pular mostra o resultado final de imediato, sem recalcular', async ({ page }) => {
  await goToTab(page, /Arena/)
  await page.getByRole('button', { name: /Pular/ }).click()

  const banner = page.getByTestId('winner-banner')
  await expect(banner).toBeVisible()

  const rounds = Number(await banner.getAttribute('data-rounds'))
  await expect(page.getByTestId('log-line')).toHaveCount(rounds)
  await expect(page.getByText(`Round ${rounds} / ${rounds}`)).toBeVisible()
})

test('o mesmo par de monstros produz sempre o mesmo resultado', async ({ page }) => {
  await goToTab(page, /Seleção/)
  await pickFighters(page, 'Verme Ígneo', 'Sentinela de Cristal')
  await goToTab(page, /Arena/)

  const read = async () => {
    await page.getByRole('button', { name: /Pular/ }).click()
    const banner = page.getByTestId('winner-banner')
    await expect(banner).toBeVisible()
    return {
      winner: await banner.getAttribute('data-winner'),
      rounds: await banner.getAttribute('data-rounds'),
    }
  }

  const first = await read()
  await page.getByRole('button', { name: /Lutar de novo/ }).click()
  const second = await read()

  expect(second).toEqual(first)
})

test('trocar de lutador invalida o replay em andamento', async ({ page }) => {
  await goToTab(page, /Arena/)
  await page.getByRole('button', { name: /Pular/ }).click()
  await expect(page.getByTestId('winner-banner')).toBeVisible()

  await goToTab(page, /Seleção/)
  await pickFighters(page, 'Corvo do Abismo', 'Golem de Basalto')
  await goToTab(page, /Arena/)

  await expect(page.getByTestId('winner-banner')).toHaveCount(0)
  await expect(page.getByText('Round —')).toBeVisible()
})

test('a batalha entra no histórico com vencedor, rounds e modo', async ({ page }) => {
  await goToTab(page, /Arena/)
  await page.getByRole('button', { name: /Pular/ }).click()

  const banner = page.getByTestId('winner-banner')
  const winner = await banner.getAttribute('data-winner')
  const rounds = await banner.getAttribute('data-rounds')

  await goToTab(page, /Histórico/)
  const entry = page.getByRole('listitem').first()
  await expect(entry).toContainText(winner!)
  await expect(entry).toContainText(`${rounds} rounds`)
  await expect(entry).toContainText('modo clássico')

  await page.reload()
  await goToTab(page, /Histórico/)
  await expect(page.getByRole('listitem').first()).toContainText(winner!)
})

test('limpar o histórico deixa a lista vazia', async ({ page }) => {
  await goToTab(page, /Arena/)
  await page.getByRole('button', { name: /Pular/ }).click()
  await goToTab(page, /Histórico/)

  await page.getByRole('button', { name: 'Limpar' }).click()
  await expect(page.getByText('Nenhuma batalha ainda. Vá para a arena.')).toBeVisible()
})

test('modo arena nomeia o poder no log; clássico não', async ({ page }) => {
  await goToTab(page, /Seleção/)
  await setMode(page, 'Arena')
  await goToTab(page, /Arena/)
  await page.getByRole('button', { name: /Pular/ }).click()
  await expect(page.getByTestId('log-line').first()).toContainText('·')

  const arenaEntry = page.getByTestId('log-line').first()
  const arenaText = await arenaEntry.textContent()

  await goToTab(page, /Seleção/)
  await setMode(page, 'Clássico')
  await goToTab(page, /Arena/)
  await page.getByRole('button', { name: /Pular/ }).click()
  const classicText = await page.getByTestId('log-line').first().textContent()

  expect(arenaText).not.toBe(classicText)
})
