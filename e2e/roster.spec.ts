import { expect, test } from '@playwright/test'
import { card, createMonster, openApp } from './fixtures'

test.beforeEach(async ({ page }) => openApp(page))

test('abre com o roster inicial, nunca vazio', async ({ page }) => {
  await expect(page.getByRole('article')).toHaveCount(6)
  await expect(page.getByText('6 cadastrados')).toBeVisible()
})

test('cadastra um monstro e ele sobrevive ao refresh', async ({ page }) => {
  await createMonster(page, {
    name: 'Quimera de Vidro',
    attack: 38,
    defense: 24,
    speed: 31,
    hp: 95,
    element: 'Água',
  })

  await expect(page.getByRole('article')).toHaveCount(7)

  await page.reload()

  const saved = card(page, 'Quimera de Vidro')
  await expect(saved).toBeVisible()
  await expect(saved).toContainText('38')
  await expect(saved).toContainText('Água')
})

test('exclui um monstro e a exclusão sobrevive ao refresh', async ({ page }) => {
  await page.getByRole('button', { name: 'Excluir Golem de Basalto' }).click()

  const dialog = page.getByRole('dialog')
  await expect(dialog).toContainText('Golem de Basalto')
  await dialog.getByRole('button', { name: 'Excluir' }).click()

  await expect(page.getByRole('article')).toHaveCount(5)
  await page.reload()
  await expect(page.getByRole('article')).toHaveCount(5)
  await expect(card(page, 'Golem de Basalto')).toHaveCount(0)
})

test('cancelar a exclusão não remove nada', async ({ page }) => {
  await page.getByRole('button', { name: 'Excluir Golem de Basalto' }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Cancelar' }).click()

  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.getByRole('article')).toHaveCount(6)
})

test('edita um monstro e o card reflete o novo valor', async ({ page }) => {
  await card(page, 'Lodo Ácido').getByRole('button', { name: 'Editar' }).click()

  await page.getByLabel('Ataque').fill('77')
  await page.getByRole('button', { name: 'Salvar alterações' }).click()

  await expect(card(page, 'Lodo Ácido')).toContainText('77')
  await page.reload()
  await expect(card(page, 'Lodo Ácido')).toContainText('77')
  await expect(page.getByRole('article')).toHaveCount(6)
})

test('recusa cadastro inválido e explica o motivo', async ({ page }) => {
  await page.getByLabel('Nome').fill('   ')
  await page.getByRole('button', { name: 'Salvar monstro' }).click()

  await expect(page.getByText('Dê um nome ao monstro')).toBeVisible()
  await expect(page.getByRole('article')).toHaveCount(6)
})

test('recusa image_url que não é imagem', async ({ page }) => {
  await page.getByLabel('Nome').fill('Sprite Quebrado')
  await page.getByLabel('image_url').fill('nao-e-url')
  await page.getByRole('button', { name: 'Salvar monstro' }).click()

  await expect(page.getByText(/Informe uma URL de imagem válida/)).toBeVisible()
  await expect(page.getByRole('article')).toHaveCount(6)
})

test('nenhuma imagem quebrada na tela, mesmo com sprites vindos de arquivo', async ({ page }) => {
  const broken = await page
    .locator('img')
    .evaluateAll((images) =>
      images
        .filter((image) => image instanceof HTMLImageElement && image.naturalWidth === 0)
        .map((image) => (image as HTMLImageElement).src),
    )

  expect(broken).toEqual([])
})
