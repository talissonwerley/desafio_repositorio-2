/**
 * Mescla metrics.json dos artefatos login e checkout e escreve o resumo
 * no GITHUB_STEP_SUMMARY. Compara com previous-metrics.json (cache) para tendência.
 *
 * Espera: cypress-results-login/metrics.json e cypress-results-checkout/metrics.json
 * Opcional: metrics-cache/previous-metrics.json (restaurado do cache)
 */

const fs = require('fs');
const path = require('path');

const projectRoot = process.cwd();
const stepSummaryPath = process.env.GITHUB_STEP_SUMMARY;

const loginPath = path.join(projectRoot, 'cypress-results-login', 'metrics.json');
const checkoutPath = path.join(projectRoot, 'cypress-results-checkout', 'metrics.json');
const previousPath = path.join(projectRoot, 'metrics-cache', 'previous-metrics.json');

function readJson(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    console.warn(`[merge-metrics] Não foi possível ler ${filePath}:`, e.message);
    return null;
  }
}

function formatDuration(ms) {
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`;
  return `${Math.round(ms)}ms`;
}

function buildTrend(current, previous) {
  if (!previous || previous.totalDurationMs == null) return null;
  const durationDiff = current.totalDurationMs - previous.totalDurationMs;
  const durationPct = previous.totalDurationMs > 0
    ? ((durationDiff / previous.totalDurationMs) * 100).toFixed(1)
    : '0';
  const rateDiff = (parseFloat(current.successRate) - parseFloat(previous.successRate || 0)).toFixed(1);
  return { durationDiff, durationPct, rateDiff };
}

function buildSummary(loginMetrics, checkoutMetrics, previousMerged) {
  const lines = [
    '## Métricas consolidadas (Login + Checkout)',
    '',
  ];

  const totalPassed = (loginMetrics?.passed || 0) + (checkoutMetrics?.passed || 0);
  const totalFailed = (loginMetrics?.failed || 0) + (checkoutMetrics?.failed || 0);
  const total = totalPassed + totalFailed;
  const totalDurationMs = (loginMetrics?.totalDurationMs || 0) + (checkoutMetrics?.totalDurationMs || 0);
  const successRate = total > 0 ? ((totalPassed / total) * 100).toFixed(1) : '0';

  const currentMerged = {
    total,
    totalPassed,
    totalFailed,
    totalDurationMs,
    successRate,
    timestamp: new Date().toISOString(),
  };

  const trend = buildTrend(currentMerged, previousMerged);

  lines.push('| Métrica | Valor |');
  lines.push('|---------|-------|');
  lines.push(`| **Total de testes** | ${total} |`);
  lines.push(`| **Passaram** | ${totalPassed} |`);
  lines.push(`| **Falharam** | ${totalFailed} |`);
  lines.push(`| **Taxa de sucesso** | ${successRate}% |`);
  lines.push(`| **Duração total** | ${formatDuration(totalDurationMs)} |`);
  if (trend) {
    const durationSign = trend.durationDiff >= 0 ? '+' : '';
    lines.push(`| **Tendência duração** | ${durationSign}${formatDuration(trend.durationDiff)} (${durationSign}${trend.durationPct}%) |`);
    const rateSign = parseFloat(trend.rateDiff) >= 0 ? '+' : '';
    lines.push(`| **Tendência taxa sucesso** | ${rateSign}${trend.rateDiff} p.p. |`);
  }
  lines.push('');

  if (loginMetrics?.specs?.length) {
    lines.push('### Login');
    lines.push('');
    lines.push('| Spec | Duração | Status |');
    lines.push('|------|---------|--------|');
    for (const s of loginMetrics.specs) {
      lines.push(`| ${s.spec} | ${s.durationFormatted} | ${s.status === 'passed' ? '✅' : '❌'} |`);
    }
    lines.push('');
  }

  if (checkoutMetrics?.specs?.length) {
    lines.push('### Checkout');
    lines.push('');
    lines.push('| Spec | Duração | Status |');
    lines.push('|------|---------|--------|');
    for (const s of checkoutMetrics.specs) {
      lines.push(`| ${s.spec} | ${s.durationFormatted} | ${s.status === 'passed' ? '✅' : '❌'} |`);
    }
  }

  return { summary: lines.join('\n'), currentMerged };
}

function main() {
  const loginMetrics = readJson(loginPath);
  const checkoutMetrics = readJson(checkoutPath);
  const previousMerged = readJson(previousPath);

  const { summary, currentMerged } = buildSummary(loginMetrics, checkoutMetrics, previousMerged);

  const cacheDir = path.join(projectRoot, 'metrics-cache');
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
  fs.writeFileSync(previousPath, JSON.stringify(currentMerged, null, 2), 'utf8');

  if (stepSummaryPath) {
    try {
      fs.appendFileSync(stepSummaryPath, '\n' + summary, 'utf8');
      console.log('[merge-metrics] Resumo consolidado escrito no Step Summary');
    } catch (e) {
      console.warn('[merge-metrics] Erro ao escrever Step Summary:', e.message);
    }
  }

  console.log(summary);
}

main();
