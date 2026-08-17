import { expect, test } from '@playwright/test'
import { goToTab, openApp } from './fixtures'

test.beforeEach(async ({ page }) => openApp(page))

const openBracket = async (page: Parameters<typeof goToTab>[0]) => {
  await goToTab(page, /Torneio/)
  await page.getByRole('button', { name: 'Montar chave' }).click()
}

test('monta a chave de 4 com os monstros mais fortes', async ({ page }) => {
  await openBracket(page)

  await expect(page.getByTestId('bracket-match')).toHaveCount(3)
  await expect(page.getByText('Semifinal', { exact: true })).toBeVisible()
  await expect(page.getByText('Final', { exact: true })).toBeVisible()
})

test('joga confronto a confronto até sair o campeão', async ({ page }) => {
  await openBracket(page)

  const next = page.getByRole('button', { name: /Próximo confronto/ })
  await next.click()
  await next.click()
  await next.click()

  const champion = page.getByTestId('tournament-champion')
  await expect(champion).toBeVisible()

  // O campeão precisa ser o vencedor da final, que é o último confronto do bracket.
  const finalMatch = page.getByTestId('bracket-match').last()
  expect(await champion.getAttribute('data-champion')).toBe(
    await finalMatch.getAttribute('data-winner'),
  )
  await expect(next).toBeDisabled()
})

test('simular tudo resolve a chave inteira', async ({ page }) => {
  await openBracket(page)
  await page.getByRole('button', { name: /Simular tudo/ }).click()

  await expect(page.getByTestId('tournament-champion')).toBeVisible()

  const winners = await page
    .getByTestId('bracket-match')
    .evaluateAll((cards) => cards.map((card) => card.getAttribute('data-winner')))
  expect(winners.every(Boolean)).toBe(true)
})

test('o vencedor de cada confronto aparece na fase seguinte', async ({ page }) => {
  await openBracket(page)
  await page.getByRole('button', { name: /Simular tudo/ }).click()

  const cards = page.getByTestId('bracket-match')
  const semiWinners = [
    await cards.nth(0).getAttribute('data-winner'),
    await cards.nth(1).getAttribute('data-winner'),
  ]

  const finalText = await cards.nth(2).textContent()
  for (const winner of semiWinners) {
    expect(finalText).toContain(winner!)
  }
})

test('chave de 8 exige 8 monstros e explica quando faltam', async ({ page }) => {
  await goToTab(page, /Torneio/)
  await page.getByRole('button', { name: '8 monstros' }).click()

  await expect(page.getByText(/Cadastre pelo menos 8/)).toBeVisible()
  await expect(page.getByRole('button', { name: 'Montar chave' })).toBeDisabled()
})

test('o torneio registra cada confronto no histórico', async ({ page }) => {
  await openBracket(page)
  await page.getByRole('button', { name: /Simular tudo/ }).click()

  await goToTab(page, /Histórico/)
  await expect(page.getByRole('listitem')).toHaveCount(3)
})

test('nova chave volta para a tela de montagem', async ({ page }) => {
  await openBracket(page)
  await page.getByRole('button', { name: /Nova chave/ }).click()

  await expect(page.getByRole('button', { name: 'Montar chave' })).toBeVisible()
  await expect(page.getByTestId('bracket-match')).toHaveCount(0)
})
