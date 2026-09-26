#!/usr/bin/env node

/**
 * Secret scanner: searches source files for potential hardcoded secrets.
 * Exit code 0 = clean, exit code 1 = potential secrets found.
 */

const fs = require('fs');
const path = require('path');

const PATTERNS = [
  /(?<![A-Z_])API_KEY\s*[:=]\s*['"][^'"]+['"]/g,
  /(?<![A-Z_])SECRET\s*[:=]\s*['"][^'"]+['"]/g,
  /(?<![A-Z_])PRIVATE_KEY\s*[:=]\s*['"][^'"]+['"]/g,
  /password\s*[:=]\s*['"][^'"]+['"]/gi,
];

const EXCLUDE_DIRS = new Set([
  'node_modules',
  '.next',
  '.open-next',
  'dist',
  '.git',
  'coverage',
  'scripts',
  '.planning',
  '.gemini',
  '.claude',
  '.kilo',
  'build',
  'out',
]);

const INCLUDE_EXTENSIONS = new Set(['.ts', '.tsx', '.json', '.js', '.mjs']);

const EXCLUDE_FILES = new Set(['.env.example', 'package-lock.json', 'secret-scan.js']);

function walkDir(dir, results = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (EXCLUDE_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath, results);
    } else if (INCLUDE_EXTENSIONS.has(path.extname(entry.name)) && !EXCLUDE_FILES.has(entry.name)) {
      results.push(fullPath);
    }
  }
  return results;
}

const root = path.resolve(__dirname, '..');
const files = walkDir(root);
let found = false;

for (const file of files) {
  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Skip comments and pattern definitions
    if (
      line.trim().startsWith('//') ||
      line.trim().startsWith('*') ||
      line.includes('.default(') ||
      line.includes('.optional()') ||
      line.includes('z.string()') ||
      line.includes('process.env')
    ) {
      continue;
    }

    for (const pattern of PATTERNS) {
      pattern.lastIndex = 0;
      if (pattern.test(line)) {
        const relPath = path.relative(root, file);
        console.log(`⚠️ MATCH FOUND in ${relPath}:${i + 1} -> ${line.substring(0, 80)}`);
        found = true;
      }
    }
  }
}

if (found) {
  console.log('\n❌ Potential secrets found in source files!');
  process.exit(1);
} else {
  console.log('✅ No hardcoded secrets found in source files.');
  process.exit(0);
}
