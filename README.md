# Islandiapp

Roteiro de camper van pela Islândia — Rafael + Karine, 07 a 20 de setembro.

## A pasta que importa: `/data`

```
data/
  roteiro.json   ← os 14 dias: atividades, campings, km, notas
  links.json     ← os links úteis, agrupados por categoria
```

Pra atualizar o roteiro, edite esses dois arquivos — não precisa mexer
em nenhum código. Dá pra editar direto pelo site do GitHub (abra o
arquivo, clique no lápis ✏️, edite, "Commit changes").

### Formato de um dia em `roteiro.json`

```json
{
  "dia": 1,
  "data": "07 set · dom",
  "regiao": "Reykjanes",
  "km": 74,
  "duracao": "1h20",
  "nota": "Pega da van em Keflavík...",
  "atividades": [
    {
      "nome": "Gunnuhver",
      "descricao": "Fumarolas fervendo em barro ocre.",
      "classificacao": 2,
      "categoria": "T",
      "distancia": "9 km"
    }
  ],
  "campings": [
    {
      "nome": "Grindavík Camping",
      "preco": "2.500 ISK/pessoa",
      "descricao": "Cozinha coberta, chuveiro incluso.",
      "disponibilidade": "até 30 set"
    }
  ]
}
```

- `classificacao`: `1` imperdível · `2` legal · `3` passável
- `categoria`: `"C"` cachoeira · `"H"` hike · `"A"` atração · `"T"` termal
- `disponibilidade`: use exatamente `"ano todo"` pro camping ganhar o
  selo verde; qualquer outro texto (`"até 30 set"` etc.) vira o selo laranja

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
