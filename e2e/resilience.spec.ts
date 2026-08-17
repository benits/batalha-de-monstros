import { expect, test, type Page } from '@playwright/test'
import { openApp } from './fixtures'

/**
 * `localStorage` é entrada não confiável: o usuário pode editar a chave na mão,
 * e uma versão anterior do app pode ter salvo outro formato. Nenhum destes
 * cenários deve resultar em tela branca.
 */

/** `page.evaluate` serializa a função, então chave e valor viajam como argumento. */
const writeStorage = (page: Page, key: string, value: string) =>
  page.evaluate(
    ([storageKey, storageValue]) => localStorage.setItem(storageKey, storageValue),
    [key, value] as const,
  )

const persisted = (state: unknown) => JSON.stringify({ state, version: 1 })

test.beforeEach(async ({ page }) => openApp(page))

test('estado salvo ilegível volta ao roster inicial', async ({ page }) => {
  await writeStorage(page, 'revi:monsters', 'isso não é json')
  await page.reload()

  await expect(page.getByRole('article')).toHaveCount(6)
  await expect(page.getByRole('tab', { name: /Roster/ })).toBeVisible()
})

test('estado salvo com formato errado volta ao roster inicial', async ({ page }) => {
  await writeStorage(page, 'revi:monsters', persisted({ monsters: 'não é array' }))
  await page.reload()

  await expect(page.getByRole('article')).toHaveCount(6)
})

test('monstro corrompido é descartado, e os válidos permanecem', async ({ page }) => {
  await writeStorage(
    page,
    'revi:monsters',
    persisted({
      monsters: [
        {
          id: 'ok',
          name: 'Sobrevivente',
          attack: 20,
          defense: 10,
          speed: 10,
          hp: 50,
          imageUrl: '',
          element: 'fogo',
        },
        { id: 'ruim', name: '', attack: -5 },
        { lixo: true },
      ],
    }),
  )
  await page.reload()

  await expect(page.getByRole('article')).toHaveCount(1)
  await expect(page.getByText('Sobrevivente')).toBeVisible()
})

test('roster legitimamente vazio é respeitado, sem re-semear', async ({ page }) => {
  await writeStorage(page, 'revi:monsters', persisted({ monsters: [] }))
  await page.reload()

  await expect(page.getByRole('article')).toHaveCount(0)
  await expect(page.getByText(/Nenhum monstro ainda/)).toBeVisible()
  await expect(page.getByText('0 cadastrados')).toBeVisible()
})

test('com menos de dois monstros, a batalha explica o que falta', async ({ page }) => {
  await writeStorage(page, 'revi:monsters', persisted({ monsters: [] }))
  await page.reload()

  await page.getByRole('tab', { name: /Arena/ }).click()
  await expect(page.getByText(/Escolha dois monstros diferentes/)).toBeVisible()

  await page.getByRole('tab', { name: /Seleção/ }).click()
  await expect(page.getByText(/Cadastre ao menos dois monstros/)).toBeVisible()
})

test('preferências corrompidas não impedem o app de abrir', async ({ page }) => {
  await writeStorage(page, 'revi:settings', '{{{')
  await page.reload()

  await expect(page.getByRole('tab', { name: /Roster/ })).toBeVisible()
  await page.getByRole('tab', { name: /Seleção/ }).click()
  await expect(page.getByRole('button', { name: 'Clássico', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
})
