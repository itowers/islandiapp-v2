#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');
const imagesDir = path.join(projectRoot, 'public/images');
const roteiroPath = path.join(projectRoot, 'data/roteiro-2026.json');

// Criar diretório se não existir
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
  console.log(`✓ Criado diretório: ${imagesDir}`);
}

// Ler arquivo roteiro
const roteiro = JSON.parse(fs.readFileSync(roteiroPath, 'utf-8'));

// Extrair todos os highlights com imageUrl
const highlights = [];
for (const day of roteiro.dias) {
  for (const highlight of day.highlights || []) {
    if (highlight.id && highlight.imageUrl) {
      highlights.push({
        id: highlight.id,
        url: highlight.imageUrl,
        name: highlight.name,
      });
    }
  }
}

console.log(`\n📸 Iniciando download de ${highlights.length} imagens...\n`);

const results = {
  success: [],
  failed: [],
};

// Download com retry
async function downloadWithRetry(url, filepath, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; islandiapp-image-downloader/1.0)',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const buffer = await response.arrayBuffer();

      // Validar que é JPEG
      const header = new Uint8Array(buffer).slice(0, 3);
      const isJpeg = header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff;
      if (!isJpeg) {
        throw new Error('Not a valid JPEG file');
      }

      fs.writeFileSync(filepath, Buffer.from(buffer));
      return true;
    } catch (error) {
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt - 1) * 1000;
        console.log(
          `  ⏱️  Tentativa ${attempt}/${maxRetries} falhou, aguardando ${delay}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
}

// Executar downloads sequencialmente com rate limiting
(async () => {
  for (let i = 0; i < highlights.length; i++) {
    const highlight = highlights[i];
    const filepath = path.join(imagesDir, `${highlight.id}.jpg`);

    try {
      process.stdout.write(
        `[${String(i + 1).padStart(2, '0')}/${highlights.length}] ${highlight.id.padEnd(25)} ... `
      );

      await downloadWithRetry(highlight.url, filepath);

      const stats = fs.statSync(filepath);
      const sizeKb = (stats.size / 1024).toFixed(1);
      console.log(`✓ ${sizeKb}KB`);

      results.success.push(highlight.id);

      // Rate limiting: 300ms entre requisições
      if (i < highlights.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    } catch (error) {
      console.log(`✗ Erro: ${error.message}`);
      results.failed.push({
        id: highlight.id,
        error: error.message,
      });
    }
  }

  // Relatório final
  console.log(`\n${'='.repeat(60)}`);
  console.log(`✓ Downloads bem-sucedidos: ${results.success.length}/${highlights.length}`);
  if (results.failed.length > 0) {
    console.log(`✗ Downloads falhados: ${results.failed.length}`);
    results.failed.forEach((item) => {
      console.log(`  - ${item.id}: ${item.error}`);
    });
  }
  console.log(`${'='.repeat(60)}\n`);

  // Verificar diretório
  const downloadedFiles = fs.readdirSync(imagesDir);
  const totalSize = downloadedFiles.reduce((sum, file) => {
    const filepath = path.join(imagesDir, file);
    return sum + fs.statSync(filepath).size;
  }, 0);

  console.log(`📁 Imagens em ${imagesDir}:`);
  console.log(`   Total de arquivos: ${downloadedFiles.length}`);
  console.log(`   Tamanho total: ${(totalSize / 1024 / 1024).toFixed(2)}MB`);
  console.log();

  // Salvar relatório
  const reportPath = path.join(projectRoot, 'download-report.json');
  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        total: highlights.length,
        successful: results.success.length,
        failed: results.failed.length,
        details: results,
        totalSizeBytes: totalSize,
      },
      null,
      2
    )
  );

  console.log(`📊 Relatório salvo em: download-report.json\n`);

  process.exit(results.failed.length > 0 ? 1 : 0);
})();
