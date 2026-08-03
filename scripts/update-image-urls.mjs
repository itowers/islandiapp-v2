#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');
const roteiroPath = path.join(projectRoot, 'data/roteiro-2026.json');

console.log('📝 Atualizando URLs das imagens em roteiro-2026.json...\n');

// Ler arquivo roteiro
const roteiro = JSON.parse(fs.readFileSync(roteiroPath, 'utf-8'));

let updated = 0;
let skipped = 0;

// Atualizar todas as URLs
for (const day of roteiro.dias) {
  for (const highlight of day.highlights || []) {
    if (highlight.imageUrl) {
      // Verificar se já é uma URL local
      if (highlight.imageUrl.startsWith('/images/')) {
        skipped++;
        continue;
      }

      // Extrair ID e criar nova URL local
      const newUrl = `/images/${highlight.id}.jpg`;
      const oldUrl = highlight.imageUrl;

      highlight.imageUrl = newUrl;
      updated++;

      console.log(`✓ ${highlight.id.padEnd(30)} ${newUrl}`);
    }
  }
}

// Salvar arquivo atualizado
fs.writeFileSync(roteiroPath, JSON.stringify(roteiro, null, 2) + '\n');

console.log(`\n${'='.repeat(60)}`);
console.log(`✓ Atualizadas: ${updated}`);
console.log(`⊘ Já locais: ${skipped}`);
console.log(`${'='.repeat(60)}\n`);

// Validações
let remoteUrls = 0;
let localUrls = 0;

for (const day of roteiro.dias) {
  for (const highlight of day.highlights || []) {
    if (highlight.imageUrl) {
      if (highlight.imageUrl.startsWith('/images/')) {
        localUrls++;
      } else if (highlight.imageUrl.startsWith('http')) {
        remoteUrls++;
      }
    }
  }
}

console.log('📊 Validação final:');
console.log(`   URLs locais (/images/*): ${localUrls}`);
console.log(`   URLs remotas (http*): ${remoteUrls}`);

if (remoteUrls === 0) {
  console.log(`\n✓ Sucesso! Todas as imagens estão com URLs locais.\n`);
} else {
  console.log(
    `\n⚠️  Aviso: Ainda existem ${remoteUrls} URLs remotas. Verifique o arquivo.\n`
  );
  process.exit(1);
}
