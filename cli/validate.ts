/**
 * AACA Validator
 *
 * Checks that a project follows AACA structural conventions:
 * - Required root files exist
 * - All operations referenced in SYSTEM.manifest.yaml have directories
 * - Each operation has MODULE.manifest.yaml and CONTEXT.md
 * - Each directory has CONTEXT.md
 * - Contracts referenced in module manifests exist
 */

import * as fs from 'fs';
import * as path from 'path';
import YAML from 'yaml';

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export async function validate(projectRoot: string): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Check required root files
  const requiredRootFiles = [
    'SYSTEM.manifest.yaml',
    'CONTEXT.md',
    'DECISIONS.yaml',
    'GLOSSARY.yaml',
  ];

  for (const file of requiredRootFiles) {
    if (!fileExists(projectRoot, file)) {
      errors.push(`Missing required root file: ${file}`);
    }
  }

  // 2. Parse SYSTEM.manifest.yaml
  const systemManifestPath = path.join(projectRoot, 'SYSTEM.manifest.yaml');
  if (!fs.existsSync(systemManifestPath)) {
    return { valid: false, errors, warnings };
  }

  let systemManifest: any;
  try {
    const content = fs.readFileSync(systemManifestPath, 'utf-8');
    systemManifest = YAML.parse(content);
  } catch (err) {
    errors.push(`Failed to parse SYSTEM.manifest.yaml: ${(err as Error).message}`);
    return { valid: false, errors, warnings };
  }

  // 3. Validate system fields
  if (!systemManifest?.system?.name) {
    errors.push('SYSTEM.manifest.yaml: system.name is required');
  }
  if (!systemManifest?.system?.language) {
    errors.push('SYSTEM.manifest.yaml: system.language is required');
  }
  if (!systemManifest?.system?.aaca_version) {
    errors.push('SYSTEM.manifest.yaml: system.aaca_version is required');
  }

  // 4. Check operations
  const operations = systemManifest?.operations || [];
  for (const op of operations) {
    const opPath = path.join(projectRoot, op.path);
    if (!fs.existsSync(opPath)) {
      errors.push(`Operation directory not found: ${op.path}`);
      continue;
    }

    if (!fileExists(opPath, 'MODULE.manifest.yaml')) {
      errors.push(`${op.path}: Missing MODULE.manifest.yaml`);
    }
    if (!fileExists(opPath, 'CONTEXT.md')) {
      errors.push(`${op.path}: Missing CONTEXT.md`);
    }

    // Validate MODULE.manifest.yaml if it exists
    const moduleManifestPath = path.join(opPath, 'MODULE.manifest.yaml');
    if (fs.existsSync(moduleManifestPath)) {
      try {
        const content = fs.readFileSync(moduleManifestPath, 'utf-8');
        const moduleManifest = YAML.parse(content);

        // Check all declared files exist
        const files = moduleManifest?.files || [];
        for (const file of files) {
          if (!fileExists(opPath, file.path)) {
            warnings.push(`${op.path}: Declared file not found: ${file.path}`);
          }
        }

        // Check referenced contracts exist
        const contracts = moduleManifest?.dependencies?.contracts || [];
        for (const contract of contracts) {
          if (!fileExists(projectRoot, contract)) {
            errors.push(`${op.path}: Referenced contract not found: ${contract}`);
          }
        }
      } catch (err) {
        errors.push(`${op.path}/MODULE.manifest.yaml: Parse error: ${(err as Error).message}`);
      }
    }
  }

  // 5. Check capabilities
  const capabilities = systemManifest?.capabilities || [];
  for (const cap of capabilities) {
    const capPath = path.join(projectRoot, cap.path);
    if (!fs.existsSync(capPath)) {
      errors.push(`Capability directory not found: ${cap.path}`);
    }
  }

  // 6. Check infrastructure
  const infrastructure = systemManifest?.infrastructure || [];
  for (const infra of infrastructure) {
    const infraPath = path.join(projectRoot, infra.path);
    if (!fs.existsSync(infraPath)) {
      errors.push(`Infrastructure directory not found: ${infra.path}`);
    }
  }

  // 7. Check directory CONTEXT.md files
  const dirsToCheck = [
    'contracts',
    'operations',
    'capabilities',
    'infrastructure',
  ];
  for (const dir of dirsToCheck) {
    const dirPath = path.join(projectRoot, dir);
    if (fs.existsSync(dirPath) && !fileExists(dirPath, 'CONTEXT.md')) {
      warnings.push(`${dir}/: Missing CONTEXT.md`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

function fileExists(dir: string, filename: string): boolean {
  return fs.existsSync(path.join(dir, filename));
}
