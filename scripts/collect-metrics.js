/**
 * Coleta métricas de qualidade a partir dos JSONs do Mochawesome.
 * Lê cypress/results/reports/.jsons/*.json (gerados pelo cypress-mochawesome-reporter)
 * e gera metrics.json + resumo em Markdown para o GitHub Actions (GITHUB_STEP_SUMMARY).
 *
 * Uso: node scripts/collect-metrics.js [diretório-.jsons]
 *      Diretório padrão: cypress/results/reports/.jsons
 *      Ou variável de ambiente: CYPRESS_REPORTS_JSONS_DIR
 */

const fs = require('fs');
const path = require('path');

const projectRoot = process.cwd();
const jsonDir = process.argv[2] || process.env.CYPRESS_REPORTS_JSONS_DIR || path.join(projectRoot, 'cypress/results/reports/.jsons');
const metricsOutputPath = path.join(projectRoot, 'cypress/results/metrics.json');
const stepSummaryPath = process.env.GITHUB_STEP_SUMMARY;

function ensureDir(dir) {
  const parent = path.dirname(dir);
  if (!fs.existsSync(parent)) {
    ensureDir(parent);
  }
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function collectFromJsons(dir) {
  if (!fs.existsSync(dir)) {
    return { specs: [], totalDuration: 0, passed: 0, failed: 0, total: 0 };
  }

  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
  const specs = [];
  let totalDuration = 0;
  let passed = 0;
  let failed = 0;

  for (const file of files) {
    const filePath = path.join(dir, file);
    let data;
    try {
      data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
      console.warn(`[collect-metrics] Ignorando ${file}: ${e.message}`);
      continue;
    }

    const stats = data.stats || {};
    const duration = typeof stats.duration === 'number' ? stats.duration : 0;
    const specPassed = (stats.passes || 0);
    const specFailed = (stats.failures || 0);
    const specName = (data.results && data.results[0] && (data.results[0].file || data.results[0].fullFile)) || file;

    specs.push({
      spec: path.basename(specName, path.extname(specName)),
      file: specName,
      durationMs: Math.round(duration),
      durationFormatted: formatDuration(duration),
      passed: specPassed,
      failed: specFailed,
      status: specFailed > 0 ? 'failed' : 'passed',
    });

    totalDuration += duration;
    passed += specPassed;
    failed += specFailed;
  }

  return {
    specs,
    totalDurationMs: Math.round(totalDuration),
    totalDurationFormatted: formatDuration(totalDuration),
    passed,
    failed,
    total: passed + failed,
    successRate: passed + failed > 0 ? ((passed / (passed + failed)) * 100).toFixed(1) : '0',
    timestamp: new Date().toISOString(),
  };
}

function formatDuration(ms) {
  if (ms >= 1000) {
    return `${(ms / 1000).toFixed(2)}s`;
  }
  return `${Math.round(ms)}ms`;
}

function toMarkdown(metrics) {
  const lines = [
    '## Métricas de testes',
    '',
    `| Métrica | Valor |`,
    `|---------|-------|`,
    `| Total de specs | ${metrics.specs.length} |`,
    `| Testes passaram | ${metrics.passed} |`,
    `| Testes falharam | ${metrics.failed} |`,
    `| Taxa de sucesso | ${metrics.successRate}% |`,
    `| Duração total | ${metrics.totalDurationFormatted} |`,
    '',
    '### Por spec',
    '',
    '| Spec | Duração | Status |',
    '|------|---------|--------|',
  ];

  for (const s of metrics.specs) {
    lines.push(`| ${s.spec} | ${s.durationFormatted} | ${s.status === 'passed' ? '✅' : '❌'} ${s.status} |`);
  }

  return lines.join('\n');
}

function main() {
  const metrics = collectFromJsons(jsonDir);

  ensureDir(path.dirname(metricsOutputPath));
  fs.writeFileSync(metricsOutputPath, JSON.stringify(metrics, null, 2), 'utf8');
  console.log('[collect-metrics] Métricas salvas em', metricsOutputPath);

  const markdown = toMarkdown(metrics);
  if (stepSummaryPath) {
    try {
      fs.appendFileSync(stepSummaryPath, '\n' + markdown, 'utf8');
      console.log('[collect-metrics] Resumo adicionado ao GitHub Step Summary');
    } catch (e) {
      console.warn('[collect-metrics] Não foi possível escrever no Step Summary:', e.message);
    }
  } else {
    console.log('\n' + markdown);
  }

  if (metrics.specs.length === 0) {
    console.warn('[collect-metrics] Nenhum JSON encontrado em', jsonDir);
  }
}

main();
