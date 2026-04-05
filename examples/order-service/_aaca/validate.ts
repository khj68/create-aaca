/**
 * AACA Structure Validation Script
 *
 * Validates that the order-service project follows the AACA architecture:
 * 1. SYSTEM.manifest.yaml exists at the root
 * 2. All referenced operation directories exist
 * 3. Each operation has MODULE.manifest.yaml and CONTEXT.md
 *
 * Usage:
 *   npx tsx _aaca/validate.ts
 *   # or
 *   node --loader ts-node/esm _aaca/validate.ts
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

const ROOT = path.resolve(__dirname, '..');

interface ValidationResult {
  check: string;
  passed: boolean;
  details?: string;
}

const results: ValidationResult[] = [];

function check(name: string, passed: boolean, details?: string): void {
  results.push({ check: name, passed, details });
}

function fileExists(filePath: string): boolean {
  return fs.existsSync(path.join(ROOT, filePath));
}

function dirExists(dirPath: string): boolean {
  const full = path.join(ROOT, dirPath);
  return fs.existsSync(full) && fs.statSync(full).isDirectory();
}

// ---------------------------------------------------------------------------
// 1. Check root files
// ---------------------------------------------------------------------------

check(
  'SYSTEM.manifest.yaml exists',
  fileExists('SYSTEM.manifest.yaml'),
);

check(
  'CONTEXT.md exists at root',
  fileExists('CONTEXT.md'),
);

check(
  'DECISIONS.yaml exists',
  fileExists('DECISIONS.yaml'),
);

check(
  'GLOSSARY.yaml exists',
  fileExists('GLOSSARY.yaml'),
);

// ---------------------------------------------------------------------------
// 2. Check that all referenced operation directories exist
// ---------------------------------------------------------------------------

// Parse operations from SYSTEM.manifest.yaml (simple regex, not full YAML parse)
const manifestPath = path.join(ROOT, 'SYSTEM.manifest.yaml');
if (fs.existsSync(manifestPath)) {
  const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
  const operationPaths: string[] = [];

  // Extract paths from "path: operations/xxx" lines
  const pathMatches = manifestContent.matchAll(/^\s+path:\s+(.+)$/gm);
  for (const match of pathMatches) {
    const p = match[1].trim();
    if (p.startsWith('operations/')) {
      operationPaths.push(p);
    }
  }

  for (const opPath of operationPaths) {
    check(
      `Operation directory exists: ${opPath}`,
      dirExists(opPath),
      dirExists(opPath) ? undefined : `Directory not found: ${opPath}`,
    );
  }

  // ---------------------------------------------------------------------------
  // 3. Check each operation has MODULE.manifest.yaml and CONTEXT.md
  // ---------------------------------------------------------------------------

  for (const opPath of operationPaths) {
    if (dirExists(opPath)) {
      check(
        `${opPath}/MODULE.manifest.yaml exists`,
        fileExists(`${opPath}/MODULE.manifest.yaml`),
      );

      check(
        `${opPath}/CONTEXT.md exists`,
        fileExists(`${opPath}/CONTEXT.md`),
      );
    }
  }
} else {
  check(
    'Parse SYSTEM.manifest.yaml',
    false,
    'Cannot validate operations: SYSTEM.manifest.yaml not found',
  );
}

// ---------------------------------------------------------------------------
// 4. Check capabilities, infrastructure, and entry-points
// ---------------------------------------------------------------------------

const modules = [
  'capabilities/event-publishing',
  'infrastructure/postgres',
  'entry-points/http',
];

for (const mod of modules) {
  check(
    `Module directory exists: ${mod}`,
    dirExists(mod),
  );

  if (dirExists(mod)) {
    check(
      `${mod}/MODULE.manifest.yaml exists`,
      fileExists(`${mod}/MODULE.manifest.yaml`),
    );

    check(
      `${mod}/CONTEXT.md exists`,
      fileExists(`${mod}/CONTEXT.md`),
    );
  }
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

console.log('\n=== AACA Structure Validation ===\n');

let passed = 0;
let failed = 0;

for (const r of results) {
  const icon = r.passed ? 'PASS' : 'FAIL';
  console.log(`  [${icon}] ${r.check}`);
  if (r.details) {
    console.log(`         ${r.details}`);
  }
  if (r.passed) passed++;
  else failed++;
}

console.log(`\n  Total: ${results.length} checks, ${passed} passed, ${failed} failed\n`);

if (failed > 0) {
  process.exit(1);
}
