import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { goToTab, openApp } from './fixtures'

test.beforeEach(async ({ page }) => openApp(page))

const scan = (page: Parameters<typeof goToTab>[0]) =>
  new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()

const SCREENS: [string, RegExp][] = [
  ['roster', /Roster/],
  ['seleção', /Seleção/],
  ['arena', /Arena/],
  ['histórico', /Histórico/],
]

for (const [label, tab] of SCREENS) {
  test(`a tela de ${label} não tem violação de acessibilidade`, async ({ page }) => {
    await goToTab(page, tab)
    const { violations } = await scan(page)

    /* Reporta o nó e o motivo, não só o id da regra — senão a falha não diz o que arrumar. */
    const detailed = violations.flatMap((violation) =>
      violation.nodes.map(
        (node) => `${violation.id} @ ${node.target.join(' ')} — ${node.failureSummary?.replace(/\s+/g, ' ')}`,
      ),
    )

    expect(detailed).toEqual([])
  })
}

test('as abas navegam por seta, Home e End', async ({ page }) => {
  const roster = page.getByRole('tab', { name: /Roster/ })
  await roster.focus()

  await page.keyboard.press('ArrowRight')
  await expect(page.getByRole('tab', { name: /Seleção/ })).toHaveAttribute('aria-selected', 'true')

  await page.keyboard.press('ArrowRight')
  await expect(page.getByRole('tab', { name: /Arena/ })).toHaveAttribute('aria-selected', 'true')

  await page.keyboard.press('ArrowLeft')
  await expect(page.getByRole('tab', { name: /Seleção/ })).toHaveAttribute('aria-selected', 'true')

  await page.keyboard.press('End')
  await expect(page.getByRole('tab', { name: /Histórico/ })).toHaveAttribute('aria-selected', 'true')

  await page.keyboard.press('Home')
  await expect(roster).toHaveAttribute('aria-selected', 'true')
})

test('só a aba ativa fica na ordem de tabulação', async ({ page }) => {
  await expect(page.getByRole('tab', { name: /Roster/ })).toHaveAttribute('tabindex', '0')
  await expect(page.getByRole('tab', { name: /Arena/ })).toHaveAttribute('tabindex', '-1')
})

test('a batalha é narrada para leitor de tela', async ({ page }) => {
  await goToTab(page, /Arena/)

  const narration = page.getByTestId('battle-narration')
  await expect(narration).toHaveAttribute('aria-live', 'polite')

  await page.getByRole('button', { name: /Pular/ }).click()
  await expect(narration).toContainText(/Fim da batalha\..* venceu em \d+ rounds\./)
})

test('as barras de HP expõem valor para leitor de tela', async ({ page }) => {
  await goToTab(page, /Arena/)

  const bars = page.getByRole('progressbar')
  await expect(bars).toHaveCount(2)
  await expect(bars.first()).toHaveAttribute('aria-valuemin', '0')
  await expect(bars.first()).toHaveAttribute('aria-valuenow', /\d+/)
})

test('o diálogo de exclusão é modal e fecha com Escape', async ({ page }) => {
  await page.getByRole('button', { name: 'Excluir Golem de Basalto' }).click()

  const dialog = page.getByRole('dialog')
  await expect(dialog).toHaveAttribute('aria-modal', 'true')

  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.getByRole('article')).toHaveCount(6)
})
