# Islandiapp

Roteiro de camper van pela Islândia — 07 a 19/20 de setembro de 2026.

## A pasta que importa: `/data`

```
data/
  roteiro-2026.json   ← voos, campings, riscos, os 13 dias, reservas, checklists...
  links.json          ← os links úteis, agrupados por categoria
  mapa-regioes.json   ← a geometria do mapa: uma região por dia de viagem
  mymaps/*.csv        ← as 3 camadas do Google My Maps (região, passeio, parking)
```

O conteúdo vem do documento `roteiro-islandia-2026` — a versão que está
no app é a **v8** (`meta.versao`).

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
- `reservasAntecipadas` — cada reserva tem `status` (`confirmada` ou
  `em-aberto`), `tipoRisco` (`ancora` ou `flexivel`) e planos B/C.
- `checklistReservas` — `confirmadas` e `emAberto` referenciam ids de
  `reservasAntecipadas`; `outrasPendencias` guarda o que não é passeio
  (parking de Landmannalaugar, hotel do stopover) e `jaResolvido` o que
  já saiu da lista.
- `descobertasCandidatas` — atrações pesquisadas fora do plano A, com
  `status` `opcao-b`, `opcao-c` ou `rejeitada` (evita repesquisar o que
  já foi descartado).
- `recursosMapa` — as camadas do Google My Maps e os CSVs de importação
  em `data/mymaps/`. `linkMapa` fica `null` até o mapa ser publicado.
- `emergencia`, `banhosTermaisNaturais`, `banhosPerigosos`,
  `equipamentos` (inclui `notas` e o `planoCompraMontreal` do stopover),
  `notasCamping`, `pendenciasGerais`, `notasContexto` —
  informações de apoio, mostradas na aba **Infos** do app.

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

### Os CSVs de `data/mymaps`

Uma linha por ponto (`Nome,Latitude,Longitude,Camada,Dias,Notas`). Cada
arquivo é importado como uma camada separada no Google My Maps
(mymaps.google.com → Criar novo mapa → Importar, uma vez por arquivo),
o que permite ligar e desligar região, passeio e parking
independentemente.

### Estrutura de `mapa-regioes.json`

O país inteiro dividido em 13 regiões — cada uma é o território mais
próximo das paradas daquele dia.

- `width` / `height` — o `viewBox` do SVG.
- `regioes` — por número do dia, o `nome` da região e a `cor` usada no
  modo "por dia".
- `paths` — o desenho de cada região. A chave `"0"` é o que fica fora do
  roteiro; chaves de três dígitos (`121`, `131`) são trechos de
  passagem, desenhados hachurados.
- `ancoras` — onde fica o rótulo de cada região (o ponto mais folgado
  dentro do polígono, pro círculo do número não vazar).
- `costa` — o contorno do país.
- `rota` — um ponto por dia, na ordem da viagem.

O conteúdo do dia (trecho, direção, camping, destaques, riscos) continua
vindo de `roteiro-2026.json`; este arquivo só carrega a geografia.

## Abas do app

- **Roteiro** — navegação dia a dia: destaques, plano de camping (A/B/C)
  e os riscos daquele dia.
- **Mapa** — o país dividido por dia de viagem, colorido por dia ou por
  risco. Tocar numa região abre a ficha daquele dia.
- **Listagem** — todos os destaques da viagem, filtráveis por risco do
  dia e com priorização (must / nice / could / pass).
- **Conversor** — ISK para real e o custo estimado de combustível.
- **Infos** — voos, emergência, checagem diária obrigatória, reservas
  (confirmadas e em aberto), links úteis, banhos termais, equipamentos e
  compras do stopover, notas, descobertas candidatas e os recursos de
  mapa do My Maps.

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
