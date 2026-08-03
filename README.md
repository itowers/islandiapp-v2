# Islandiapp

Roteiro de camper van pela Islândia — 07 a 19/20 de setembro de 2026.

## A pasta que importa: `/data`

```
data/
  roteiro-2026.json   ← voos, campings, riscos, os 13 dias, reservas, checklists...
  links.json          ← os links úteis, agrupados por categoria
```

Pra atualizar o roteiro, edite `data/roteiro-2026.json` — não precisa mexer
em nenhum código. Dá pra editar direto pelo site do GitHub (abra o
arquivo, clique no lápis ✏️, edite, "Commit changes"). O formato é
descrito em `src/data/types.ts` (o contrato) e lido por
`src/engine/roteiroLoader.ts`, que resolve as referências entre dias,
campings e riscos.

### Estrutura de `roteiro-2026.json`

- `meta` — versão, datas da viagem, transporte.
- `voos` — trechos de ida e volta.
- `campings` — registro de todos os campings (`id`, coordenadas,
  comodidades, exposição ao vento, poluição luminosa, `seasonEnd`).
- `riscos` — cada risco tem um `trigger` (vento, estrada fechada, ferry,
  visibilidade, chuva acumulada ou checagem manual), `planB` e `planC`,
  e opcionalmente uma janela de remarcação (`rescheduleWindow`).
- `dias` — os dias do roteiro. Cada dia referencia campings por id
  (`campsitePlanA`/`campsitePlanB`) e riscos por id (`riskIds`); o
  loader resolve essas referências para os objetos completos antes de
  chegar no app.
- `reservasAntecipadas`, `checklistReservas` — o que reservar e quando.
- `emergencia`, `banhosTermaisNaturais`, `banhosPerigosos`,
  `equipamentos`, `notasCamping`, `pendenciasGerais`, `notasContexto` —
  informações de apoio, mostradas na aba **Info** do app.

### Formato de um grupo em `links.json`

```json
{
  "grupo": "Condições",
  "icone": "compass",
  "itens": [
    { "titulo": "road.is", "descricao": "estradas fechadas em tempo real", "url": "https://www.road.is/" }
  ]
}
```

`icone` aceita: `compass`, `tent`, `coin`, `alert`.

## Abas do app

- **Roteiro** — navegação dia a dia: destaques, plano de camping (A/B/C)
  e os riscos daquele dia.
- **Riscos** — visão geral de todos os riscos mapeados na viagem, com
  gatilho, plano B e plano C.
- **Reservas** — reservas antecipadas por ordem de prioridade e o
  checklist (esta semana / próximas semanas / mais perto da viagem /
  já resolvido).
- **Info** — voos, emergência, checagem diária obrigatória, links
  úteis, banhos termais, equipamentos, notas e o conversor de moeda /
  combustível.

## Rodar localmente

```bash
npm install
npm run dev
```

## Build de produção

```bash
npm run build
npm run preview
```

## Deploy

Qualquer host estático serve (Vercel, Netlify, GitHub Pages). Buildar com
`npm run build` e publicar a pasta `dist/`. Depois de aberto no celular,
"Adicionar à Tela de Início" instala como app.
