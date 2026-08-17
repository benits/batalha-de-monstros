# Batalha de Monstros — Design

**Data:** 2026-08-17
**Contexto:** desafio técnico Revi. Entrega hoje, via link do GitHub.

## Objetivo

Aplicação React + TypeScript onde o usuário cadastra monstros, escolhe dois e assiste a batalha
entre eles. Sem backend: persistência em `localStorage`.

## Requisitos do enunciado (não negociáveis)

1. Cadastrar monstro com `name` (string), `attack`, `defense`, `speed`, `hp` (int) e `image_url` (string).
2. Criar uma batalha entre dois monstros.
3. Visualizar o resultado automaticamente após o fim da batalha.
4. Algoritmo de batalha:
   - Ataca primeiro quem tem maior `speed`; empate em `speed` resolve por maior `attack`.
   - `damage = attack - defense`; se `attack <= defense`, `damage = 1`.
   - `hp = hp - damage` no monstro atacado.
   - Rounds até alguém vencer. **Todos os rounds são calculados de uma vez.**
   - Vence quem zerar o `hp` do inimigo primeiro.
5. React + TypeScript. Sem backend. Testes automatizados não são exigidos.
6. README com instruções claras de como rodar.

Critérios de avaliação declarados: qualidade de código e boas práticas, noções de UI/UX,
criatividade, documentação.

## Extensões acordadas

Tudo abaixo é adição, nunca substituição. O comportamento default da aplicação cumpre o
enunciado ao pé da letra.

- Histórico de batalhas persistido.
- CRUD completo no roster (editar e excluir, além de criar).
- Efeitos sonoros sintetizados em WebAudio, com botão de mudo.
- Tipos elementares com ciclo de vantagem.
- Até 3 poderes por elemento, destravados pelo nível do monstro, cada um com animação própria.
- Sprites: presets CC0 + gerador procedural como fallback.

## Decisões de arquitetura

### D1 — Motor de batalha puro, UI burra

`simulateBattle(a, b, damageRule)` é uma função pura em `src/domain/battle/`, sem React e sem IO.
Recebe dois monstros, devolve `BattleResult` com o vencedor e o array completo de rounds.

Isso atende diretamente a exigência "todos os rounds devem ser calculados de uma vez só" e torna
a regra de negócio testável sem montar componente nenhum.

### D2 — A animação é replay, não simulação ao vivo

A UI percorre o array de rounds já calculado. Consequências:

- "Pular" mostra o resultado final imediatamente, sem recalcular nada.
- O log textual e a barra de HP leem a mesma fonte, então nunca divergem.
- A velocidade do replay (1× / 2× / 4×) não afeta o resultado.

### D3 — Regra de dano injetada como estratégia

```ts
type DamageRule = (attacker: Monster, defender: Monster, ctx: RoundContext) => DamageOutcome
```

- `classicDamage` — `max(1, attack - defense)`. Exatamente o enunciado. **É o default.**
- `arenaDamage` — aplica poder e vantagem elemental sobre o valor clássico.

Mesmo motor, mesma `BattleResult`, um argumento trocado. O toggle Clássico/Arena fica visível na
tela de seleção, e o README explica a extensão. Um avaliador confere a fórmula do enunciado sem
precisar desligar nada.

### D4 — Cinco elementos em ciclo fechado

```
ÁGUA → FOGO → PLANTA → TERRA → ELÉTRICO → ÁGUA
```

Cada elemento é forte contra o próximo (`×1.5`) e fraco contra o anterior (`×0.75`); qualquer
outro par é neutro (`×1`). A relação é derivada da posição no array, sem matriz de matchup:

```ts
const advantage = (a: Element, b: Element) => {
  const i = CYCLE.indexOf(a)
  if (CYCLE[(i + 1) % CYCLE.length] === b) return 1.5
  if (CYCLE[(i + CYCLE.length - 1) % CYCLE.length] === b) return 0.75
  return 1
}
```

Cinco elementos cabem em aritmética modular. Dezoito exigiriam uma matriz 18×18 para manter.

### D5 — Nível é derivado, não cadastrado

```ts
const levelOf = (m: Monster) =>
  clamp(1, 10, Math.floor((m.attack + m.defense + m.speed + m.hp) / 40))
```

O formulário mantém exatamente os seis campos do enunciado, mais `element`. Um monstro com stats
altos destrava mais poderes por consequência, sem campo extra e sem número mágico solto na UI.

`element` é o único campo além do enunciado. Justificado no README como extensão explícita.

### D6 — Poderes orientados a dados

Catálogo de 5 elementos × 3 poderes em `src/domain/powers/powers.catalog.ts`. Cada poder:

```ts
type Power = {
  id: string
  name: string
  element: Element
  tier: 1 | 2 | 3
  minLevel: number      // 1 | 5 | 8
  multiplier: number
  animation: AnimationKind
}
```

Escolha do poder no round é **determinística**, sem aleatoriedade: o atacante cicla pelos poderes
já destravados usando o índice do round. Rodar a mesma batalha duas vezes dá o mesmo resultado,
que é o que a exigência de "calcular tudo de uma vez" pressupõe.

As animações são renderizadas por um único componente `<PowerEffect kind={...} />` orientado ao
campo `animation` — não por quinze componentes.

### D7 — Metadados de elemento em um lugar só

`src/domain/powers/elements.ts` guarda nome, cor, ícone e posição no ciclo de cada elemento. Esse
registro alimenta a paleta do sprite procedural, o badge no card, o catálogo de poderes e a cor do
efeito visual. Adicionar um sexto elemento é editar um arquivo.

### D8 — Sprites em três camadas de fallback

1. `image_url` preenchida pelo usuário → usa.
2. Erro de carregamento ou campo vazio → sprite procedural gerado a partir do nome, com paleta do
   elemento (PRNG com seed: mesmo nome e mesmo elemento produzem sempre o mesmo monstro).
3. O formulário oferece uma galeria de presets CC0 em `public/sprites/` que preenche a `image_url`
   com um clique.

Nunca aparece imagem quebrada na tela.

### D9 — Estado

Zustand com middleware `persist`:

- `monsters.store` — roster (semeado com 6 monstros na primeira visita).
- `battles.store` — histórico das batalhas.
- `settings.store` — som, modo de dano, velocidade do replay.

O middleware resolve `localStorage` sem hook manual de serialização.

## Estrutura de pastas

```
src/
  domain/                       # sem React, sem IO
    monster/
      monster.types.ts
      monster.schema.ts         # zod
      monster.rules.ts          # levelOf, powerScore
    battle/
      battle.types.ts           # Round, BattleResult
      battle.engine.ts          # simulateBattle
      damage.rules.ts           # classicDamage | arenaDamage
      turn-order.ts             # resolveFirstAttacker
    powers/
      elements.ts               # CYCLE, advantage, metadados
      powers.catalog.ts         # 5 × 3
      powers.rules.ts           # unlockedPowers, powerForRound
  store/
    monsters.store.ts
    battles.store.ts
    settings.store.ts
  features/
    roster/                     # MonsterCard, MonsterForm, MonsterGrid, SpriteGallery
    battle/                     # Arena, HealthBar, BattleLog, PowerEffect, useBattleReplay
    history/                    # BattleHistory
  components/ui/                # PixelPanel, StatBar, Button, Select, Modal, Sprite
  lib/
    sprite/generateSprite.ts
    audio/useSfx.ts
    cn.ts
  app/
    App.tsx, routes.tsx
```

Pontos de DRY que a estrutura protege:

- `StatBar` é o mesmo componente no card, no preview do formulário, na comparação e na barra de HP.
- `PixelPanel` centraliza a borda pixelada; o `box-shadow` de quatro lados existe uma vez no projeto.
- `elements.ts` é a única fonte de verdade sobre elementos (D7).
- `useBattleReplay(result)` concentra todo o estado do replay; os componentes da Arena são
  apresentacionais.

## Telas

1. **Roster** — grid de cards com sprite, stats e badge de elemento; formulário de cadastro com
   preview ao vivo, galeria de presets e validação zod; editar e excluir por card.
2. **Seleção** — dois slots, comparativo de stats lado a lado, indicação de quem ataca primeiro e
   por quê, matchup elemental, toggle Clássico/Arena.
3. **Arena** — sprites frente a frente, barras de HP que drenam, efeito visual do poder, número de
   dano flutuante, log sincronizado, controles de velocidade e pular, banner de vitória.
4. **Histórico** — batalhas anteriores com vencedor, número de rounds e modo usado.

## Direção visual

Arcade CRT. Fundo `#0B0A14` (quase-preto com viés violeta), painéis `#171528`, borda `#3B3560`,
texto `#EFEAFF`, acento âmbar `#FFC53D`. Stats com cor semântica: ataque `#FF4D6D`, defesa
`#45E0FF`, velocidade `#FFC53D`, HP `#7CF03D`. Bordas pixeladas via `box-shadow` de quatro lados,
scanlines sutis, tipografia monoespaçada em caixa alta com tracking. Tema único escuro, assumido
como decisão — é uma tela de arcade.

Mockup validado: https://claude.ai/code/artifact/3b62d63c-3a94-4607-999b-9f0e8ea64830

## Testes

Vitest cobrindo apenas `src/domain/`:

- ordem de ataque por velocidade, e desempate por ataque.
- dano mínimo 1 quando `attack <= defense`.
- HP nunca fica negativo.
- vencedor é quem zerou o HP do inimigo.
- batalha sempre termina (sem loop infinito).
- ciclo de elementos: vantagem, desvantagem e neutro.
- destravamento de poderes por nível.
- determinismo: mesma entrada, mesmo `BattleResult`.

## Entrega

- README em PT-BR: como rodar, decisões de arquitetura, algoritmo explicado, o que foi estendido
  além do enunciado e por quê, créditos dos assets CC0.
- `git init` com commits semânticos por etapa.
- Deploy na Vercel, link no README.

## Fora de escopo

Backend, autenticação, multiplayer, torneio, evolução de monstro, i18n, tema claro.
