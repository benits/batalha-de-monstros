import { expect, test } from '@playwright/test'
import { createMonster, goToTab, openApp, pickFighters, setMode } from './fixtures'

/**
 * Estes testes existem para provar conformidade com o enunciado da Revi pela
 * interface, não pela unidade. Se alguém trocar a regra de dano ou a ordem de
 * ataque, o app quebra aqui — mesmo que o motor continue com testes verdes.
 */

test.beforeEach(async ({ page }) => openApp(page))

test('dano é exatamente ataque menos defesa, e o piso é 1', async ({ page }) => {
  // Alfa: 50/10/40/100 · Beta: 30/20/10/100, mesmo elemento para isolar a fórmula.
  // Alfa começa (velocidade 40 > 10). Alfa causa 50-20=30, Beta causa 30-10=20.
  await createMonster(page, { name: 'Alfa', attack: 50, defense: 10, speed: 40, hp: 100, element: 'Fogo' })
  await createMonster(page, { name: 'Beta', attack: 30, defense: 20, speed: 10, hp: 100, element: 'Fogo' })

  await goToTab(page, /Seleção/)
  await pickFighters(page, 'Alfa', 'Beta')
  await setMode(page, 'Clássico')

  await expect(page.getByTestId('first-attacker')).toHaveAttribute('data-first', 'Alfa')
  await expect(page.getByTestId('first-attacker')).toHaveAttribute('data-reason', 'speed')

  await goToTab(page, /Arena/)
  await page.getByRole('button', { name: /Pular/ }).click()

  const rounds = await page.getByTestId('log-line').evaluateAll((lines) =>
    lines.map((line) => ({
      attacker: line.getAttribute('data-attacker'),
      damage: Number(line.getAttribute('data-damage')),
    })),
  )

  // Alfa precisa de 4 golpes de 30 para derrubar 100 de HP; Beta acerta 3 de 20 no meio.
  expect(rounds).toEqual([
    { attacker: 'Alfa', damage: 30 },
    { attacker: 'Beta', damage: 20 },
    { attacker: 'Alfa', damage: 30 },
    { attacker: 'Beta', damage: 20 },
    { attacker: 'Alfa', damage: 30 },
    { attacker: 'Beta', damage: 20 },
    { attacker: 'Alfa', damage: 30 },
  ])

  await expect(page.getByTestId('winner-banner')).toHaveAttribute('data-winner', 'Alfa')
  await expect(page.getByTestId('winner-banner')).toHaveAttribute('data-rounds', '7')
})

test('quando o ataque não supera a defesa, o dano é 1', async ({ page }) => {
  // Fraco ataca 10 contra defesa 90: 10-90 é negativo, então o enunciado manda dano 1.
  await createMonster(page, { name: 'Fraco', attack: 10, defense: 90, speed: 60, hp: 20, element: 'Fogo' })
  await createMonster(page, { name: 'Muralha', attack: 12, defense: 90, speed: 10, hp: 20, element: 'Fogo' })

  await goToTab(page, /Seleção/)
  await pickFighters(page, 'Fraco', 'Muralha')
  await setMode(page, 'Clássico')
  await goToTab(page, /Arena/)
  await page.getByRole('button', { name: /Pular/ }).click()

  const damages = await page
    .getByTestId('log-line')
    .evaluateAll((lines) => lines.map((line) => Number(line.getAttribute('data-damage'))))

  expect(damages.every((damage) => damage === 1)).toBe(true)
  // 20 de HP caindo 1 por golpe, alternando: quem começa vence no round 39.
  expect(damages).toHaveLength(39)
  await expect(page.getByTestId('winner-banner')).toHaveAttribute('data-winner', 'Fraco')
})

test('velocidade igual resolve pelo maior ataque', async ({ page }) => {
  await createMonster(page, { name: 'Bruto', attack: 45, defense: 20, speed: 25, hp: 80, element: 'Fogo' })
  await createMonster(page, { name: 'Fragil', attack: 15, defense: 20, speed: 25, hp: 80, element: 'Fogo' })

  await goToTab(page, /Seleção/)
  await pickFighters(page, 'Bruto', 'Fragil')

  const label = page.getByTestId('first-attacker')
  await expect(label).toHaveAttribute('data-first', 'Bruto')
  await expect(label).toHaveAttribute('data-reason', 'attack')
  await expect(label).toContainText('maior ataque no desempate')

  await goToTab(page, /Arena/)
  await page.getByRole('button', { name: /Pular/ }).click()
  await expect(page.getByTestId('log-line').first()).toHaveAttribute('data-attacker', 'Bruto')
})

test('o modo padrão da aplicação é o Clássico', async ({ page }) => {
  await goToTab(page, /Seleção/)
  await expect(page.getByRole('button', { name: 'Clássico', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await expect(page.getByTestId('mode-hint')).toContainText('dano = ataque − defesa, mínimo 1')
})

test('todos os rounds já existem quando a animação começa', async ({ page }) => {
  await goToTab(page, /Arena/)
  await page.getByRole('button', { name: /Iniciar batalha/ }).click()

  // O contador anuncia o total no primeiro round: a batalha inteira foi calculada
  // antes de qualquer quadro de animação.
  const counter = page.getByText(/^Round 1 \/ \d+/)
  await expect(counter).toBeVisible()

  const total = Number((await counter.textContent())!.match(/\/ (\d+)/)![1])
  expect(total).toBeGreaterThan(1)

  await expect(page.getByTestId('winner-banner')).toBeVisible({ timeout: 60_000 })
  await expect(page.getByTestId('winner-banner')).toHaveAttribute('data-rounds', String(total))
})
