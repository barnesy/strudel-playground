#!/usr/bin/env node
/**
 * Test runner for the Strudel playground.
 *
 * The test files are plain Node scripts (no framework): each prints its own
 * results and exits non-zero on failure. This runner discovers them, runs each
 * in its own process, streams output, and aggregates pass/fail by exit code.
 *
 * Usage:
 *   npm test            # run every test file
 *   npm test -- <glob>  # run only files whose path contains <glob>
 */
import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const root = dirname(fileURLToPath(import.meta.url));

// Discover test files: *.test.js / *.test.cjs in the repo root and tests/.
function discover() {
  const isTest = (f) => f.endsWith('.test.js') || f.endsWith('.test.cjs');
  const rootFiles = readdirSync(root)
    .filter(isTest)
    .map((f) => f);
  let nestedFiles = [];
  try {
    nestedFiles = readdirSync(join(root, 'tests'))
      .filter(isTest)
      .map((f) => join('tests', f));
  } catch {
    /* no tests/ dir */
  }
  return [...rootFiles, ...nestedFiles].sort();
}

const filter = process.argv[2];
let files = discover();
if (filter) {
  files = files.filter((f) => f.includes(filter));
}

if (files.length === 0) {
  console.error(filter ? `No test files match "${filter}"` : 'No test files found.');
  process.exit(1);
}

console.log(`\nRunning ${files.length} test file(s)...\n`);

const results = [];
for (const file of files) {
  console.log('─'.repeat(70));
  console.log(`▶ ${file}`);
  console.log('─'.repeat(70));
  const { status } = spawnSync(process.execPath, [file], {
    cwd: root,
    stdio: 'inherit',
  });
  results.push({ file, ok: status === 0 });
}

console.log('\n' + '═'.repeat(70));
console.log('TEST RUNNER SUMMARY');
console.log('═'.repeat(70));
for (const { file, ok } of results) {
  console.log(`${ok ? '✅ PASS' : '❌ FAIL'}  ${file}`);
}
const failed = results.filter((r) => !r.ok);
console.log('─'.repeat(70));
console.log(`${results.length - failed.length}/${results.length} files passed`);

if (failed.length > 0) {
  process.exit(1);
}
