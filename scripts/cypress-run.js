/**
 * Script para rodar Cypress no Windows quando PATH não inclui System32/PowerShell.
 * Corrige os erros: 'chcp' não é reconhecido / spawn powershell.exe ENOENT
 * Uso: node scripts/cypress-run.js [args...]
 */
const { spawnSync } = require('child_process');
const path = require('path');

const isWindows = process.platform === 'win32';
const extraPaths = isWindows
  ? [
      path.join(process.env.SystemRoot || 'C:\\Windows', 'System32'),
      path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'WindowsPowerShell', 'v1.0'),
    ]
  : [];

if (extraPaths.length) {
  const sep = process.platform === 'win32' ? ';' : ':';
  process.env.PATH = extraPaths.join(sep) + sep + (process.env.PATH || '');
}

const result = spawnSync('npx', ['cypress', 'run', ...process.argv.slice(2)], {
  stdio: 'inherit',
  shell: true,
  env: process.env,
});

process.exit(result.status ?? 1);
