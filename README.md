# Batalha de Monstros

Desafio técnico Revi. Aplicação React + TypeScript onde você cadastra monstros, escolhe dois e
assiste à batalha entre eles. Sem backend — tudo persiste em `localStorage`.

## Como rodar

Requer Node.js 20 ou superior.

```bash
npm install
npm run dev
```

A aplicação sobe em http://localhost:5173.

```bash
npm run build     # build de produção em dist/
npm run preview   # serve o build localmente
npm test          # testes do domínio
```

## O algoritmo de batalha

Implementado exatamente como o enunciado descreve, em `src/domain/battle/`:

1. Ataca primeiro quem tem maior `speed`. Velocidades iguais, resolve pelo maior `attack`.
2. `damage = attack - defense`. Se `attack <= defense`, o dano é `1`.
3. `hp = hp - damage` no monstro atacado.
4. Os monstros se revezam até um deles zerar o `hp` do outro.
5. **Todos os rounds são calculados de uma vez**, antes de qualquer animação.

```ts
simulateBattle(monsterA, monsterB) // → { winnerId, rounds: Round[], ... }
```

`simulateBattle` é uma função pura: sem React, sem IO, sem aleatoriedade. A mesma entrada sempre
produz o mesmo resultado.

## Decisões de arquitetura

### A animação é replay, não simulação

O enunciado exige que os rounds sejam calculados de uma vez. Uma tela que mostra só o resultado
final cumpre isso, mas não é divertida. A saída foi separar cálculo de apresentação: o motor
devolve o array completo de rounds, e a UI percorre esse array.

Três consequências práticas: "Pular" mostra o resultado final sem recalcular nada; a barra de HP e
o log leem a mesma fonte, então nunca divergem; e mudar a velocidade do replay não altera o
resultado.

### Regra de dano injetada como estratégia

A aplicação abre no **Modo Clássico**, que é `max(1, attack - defense)` — a fórmula do enunciado,
sem nenhuma adição. O **Modo Arena** é opcional e liga tipos elementares e poderes.

```ts
simulateBattle(a, b, 'classic') // fórmula do enunciado — default
simulateBattle(a, b, 'arena') // + poder do round + vantagem elemental
```

Os dois modos usam o mesmo motor e devolvem a mesma estrutura. Só a função de dano muda. O toggle
fica visível na tela de seleção, junto com a fórmula em uso.

### Camadas

```
src/domain/      regra de negócio pura — sem React, sem IO, 100% testável
src/store/       estado da aplicação (Zustand + persist)
src/features/    telas e seus componentes
src/components/  UI reutilizável
src/lib/         utilitários (sprite procedural, áudio, classes)
```

`domain/` não importa de nenhuma camada acima. É o que permite testar a regra de batalha sem montar
componente nenhum.

Pontos onde a estrutura evita repetição:

- `PixelPanel` é o único arquivo que declara a borda pixelada do tema.
- `StatBar` é o mesmo componente no card, no formulário e na comparação da seleção.
- `elements.ts` é a única fonte de verdade sobre elementos — alimenta a paleta do sprite, o badge,
  o catálogo de poderes e a cor do efeito visual.
- `PowerEffect` cobre as animações dos quinze poderes; a variação é dado, não código.
- `useBattleReplay` concentra todo o estado do replay, e os componentes da arena são apresentacionais.

## Além do enunciado

Tudo abaixo é adição. O comportamento default continua sendo o do enunciado.

**Tipos elementares.** Cinco elementos num ciclo fechado: Água → Fogo → Planta → Terra → Elétrico →
Água. Cada um é forte contra o próximo (×1.5) e fraco contra o anterior (×0.75). A relação sai da
posição no array por aritmética modular, sem matriz de matchup.

**Poderes.** Três por elemento, destravados nos níveis 1, 5 e 8, cada um com animação própria. A
escolha do poder no round é determinística: o atacante cicla pelos poderes destravados usando o
índice do turno. Sem aleatoriedade, porque a batalha inteira é calculada antes de começar.

**Nível derivado.** `level = clamp(1, 10, floor((attack + defense + speed + hp) / 24))`. O
formulário mantém os seis campos do enunciado; o nível é consequência dos atributos, não um campo
extra.

**`element` é o único campo adicional** em relação ao enunciado. Sem ele não há como ter tipos.

**Sprites em três camadas.** A `image_url` que você informar tem prioridade. Se estiver vazia ou
falhar ao carregar, um sprite pixel art é gerado a partir do nome e do elemento — a silhueta vem de
um passeio aleatório com seed, então mesmo nome e mesmo elemento sempre geram o mesmo monstro. O
formulário oferece as duas origens lado a lado: sprites CC0 filtrados pelo elemento escolhido, e
variações procedurais do nome. Nenhuma chamada de rede em runtime — os PNGs são servidos pelo
próprio app.

O roster inicial vem metade com sprite CC0 e metade em branco, de propósito, para as duas camadas
ficarem visíveis na primeira tela.

**Histórico, CRUD e som.** As últimas 20 batalhas ficam salvas. Monstros podem ser editados e
excluídos. Os efeitos sonoros são sintetizados em WebAudio, sem nenhum arquivo de áudio no
repositório, e têm botão de mudo.

## Testes

O enunciado dispensa testes automatizados. Ainda assim o domínio é testado — é onde mora a regra
que está sendo avaliada.

```bash
npm test
```

Cobre ordem de ataque e desempate, dano mínimo 1, HP nunca negativo, término garantido da batalha,
determinismo do resultado, ciclo de elementos, destravamento de poderes e validação do cadastro.

## Acessibilidade e preferências

Barras de HP são `progressbar` com valores ARIA, as abas usam `role="tab"`, o foco tem contorno
visível, e `prefers-reduced-motion` desliga as animações.

## Stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · Zustand · zod · react-hook-form · Vitest

## Créditos

Os 15 sprites em `public/sprites/` vêm do tileset [Dungeon Crawl 32x32
tiles](https://opengameart.org/content/dungeon-crawl-32x32-tiles), do Dungeon Crawl Stone Soup, sob
**CC0 1.0** (domínio público). Foram apenas renomeados com o prefixo do elemento; nenhum pixel
alterado. Detalhes e mapa de arquivos em [`public/sprites/CREDITS.md`](public/sprites/CREDITS.md).
