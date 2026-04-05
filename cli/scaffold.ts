/**
 * AACA Scaffold Generator
 *
 * Creates new AACA projects or adds operations to existing ones.
 */

import * as fs from 'fs';
import * as path from 'path';

interface ScaffoldOptions {
  name: string;
  language: string;
  targetDir: string;
  mode?: 'init' | 'add-operation' | 'add-capability';
}

const EXT_MAP: Record<string, string> = {
  typescript: 'ts',
  python: 'py',
  java: 'java',
  go: 'go',
  rust: 'rs',
};

export async function scaffold(options: ScaffoldOptions): Promise<void> {
  const { name, language, targetDir, mode = 'init' } = options;
  const ext = EXT_MAP[language] || 'ts';

  if (mode === 'add-operation') {
    await addOperation(name, ext, targetDir);
    return;
  }

  await createProject(name, ext, language, targetDir);
}

async function createProject(
  name: string,
  ext: string,
  language: string,
  targetDir: string
): Promise<void> {
  // Create directory structure
  const dirs = [
    '',
    'contracts',
    'contracts/shared-types',
    'operations',
    'capabilities',
    'infrastructure',
    'entry-points/http',
    '_aaca/templates',
  ];

  for (const dir of dirs) {
    fs.mkdirSync(path.join(targetDir, dir), { recursive: true });
  }

  // SYSTEM.manifest.yaml
  writeFile(targetDir, 'SYSTEM.manifest.yaml', `# SYSTEM.manifest.yaml
# AACA v1.0 - This file is the entry point for AI agents working with this codebase.

system:
  name: "${name}"
  description: "TODO: Describe what this system does"
  version: "0.1.0"
  language: "${language}"
  aaca_version: "1.0"

operations: []

capabilities: []

infrastructure: []

agent_instructions:
  on_new_feature: |
    1. Read this manifest to understand existing operations.
    2. Check contracts/ for relevant existing contracts.
    3. Create a new operation: npx aaca add-operation <name>
    4. Define the contract first in contracts/.
    5. Implement the operation.
    6. Register the operation in this manifest.

  on_bug_fix: |
    1. Identify which operation is affected from this manifest.
    2. Read that operation's CONTEXT.md and MODULE.manifest.yaml.
    3. Make changes only within that operation's directory.
    4. If the fix crosses operation boundaries, read DECISIONS.yaml.

  on_refactor: |
    1. Read DECISIONS.yaml to understand existing constraints.
    2. Check MODULE.manifest.yaml for each affected module.
    3. Never change a contract without updating all dependent operations.
`);

  // Root CONTEXT.md
  writeFile(targetDir, 'CONTEXT.md', `# System Context: ${name}

## What This System Does
TODO: Describe what this system does in 2-3 sentences.

## Start Here
- Read \`SYSTEM.manifest.yaml\` for a machine-readable map of the entire system.
- Read \`GLOSSARY.yaml\` for domain term definitions.
- Read \`DECISIONS.yaml\` for architectural constraints you must respect.

## Common Agent Tasks
| Task | Start By Reading |
|------|-----------------|
| Add a new API endpoint | \`SYSTEM.manifest.yaml\` then \`_aaca/templates/\` |
| Fix a bug | The relevant operation's \`CONTEXT.md\` |
| Understand a business rule | The relevant operation's \`RATIONALE.md\` |
`);

  // DECISIONS.yaml
  writeFile(targetDir, 'DECISIONS.yaml', `# Architectural Decision Log
# Add decisions as the project evolves.

decisions: []
`);

  // GLOSSARY.yaml
  writeFile(targetDir, 'GLOSSARY.yaml', `# Domain Glossary
# Define domain terms so AI agents and developers use consistent language.

terms: {}
`);

  // Directory CONTEXT.md files
  writeFile(targetDir, 'contracts/CONTEXT.md', `# Context: contracts/

This directory contains all inter-module contracts.
Each contract defines the input, output, errors, and side effects of an operation.
Contracts are defined before implementation (Contracts Before Code principle).
`);

  writeFile(targetDir, 'operations/CONTEXT.md', `# Context: operations/

This directory contains one subdirectory per operation.
Each operation is a self-contained module with its own manifest, context, and implementation.
`);

  writeFile(targetDir, 'capabilities/CONTEXT.md', `# Context: capabilities/

This directory contains cross-cutting capabilities (authentication, event publishing, logging, etc.).
Each capability is used by multiple operations.
`);

  writeFile(targetDir, 'infrastructure/CONTEXT.md', `# Context: infrastructure/

This directory contains external system bindings (databases, message queues, caches, etc.).
Each infrastructure module manages connection, configuration, and health checks.
`);

  writeFile(targetDir, 'entry-points/http/CONTEXT.md', `# Context: entry-points/http/

This directory maps HTTP routes to operations.
See routes.manifest.yaml for the machine-readable route map.
`);

  writeFile(targetDir, 'entry-points/http/routes.manifest.yaml', `# HTTP Routes
# Machine-readable map of all HTTP endpoints to their operations.

routes: []
`);

  writeFile(targetDir, '_aaca/templates/CONTEXT.md', `# Context: _aaca/templates/

This directory contains templates for scaffolding new modules.
Use \`npx aaca add-operation <name>\` to generate from these templates.
`);
}

async function addOperation(
  name: string,
  ext: string,
  projectRoot: string
): Promise<void> {
  const opDir = path.join(projectRoot, 'operations', name);
  const contractDir = path.join(projectRoot, 'contracts');

  fs.mkdirSync(opDir, { recursive: true });

  // CONTEXT.md
  writeFile(opDir, 'CONTEXT.md', `# Context: ${name}

## Purpose
TODO: Describe what this operation does.

## When to Modify This Module
- TODO: List scenarios

## When NOT to Modify This Module
- TODO: List what belongs elsewhere

## Data Flow
\`\`\`
HTTP Request
  → handler.${ext} (validate request shape)
    → logic.${ext} (business rules)
    → persistence.${ext} (data access)
  ← handler.${ext} (format response)
\`\`\`
`);

  // MODULE.manifest.yaml
  writeFile(opDir, 'MODULE.manifest.yaml', `module:
  name: "${name}"
  type: "operation"
  description: "TODO: Describe this operation"
  status: "draft"

purpose: |
  TODO: Explain why this operation exists.

files:
  - path: "handler.${ext}"
    role: "entry-point"
    description: "Receives request, delegates to logic, returns response"
    changes_when: "Request/response shape changes"

  - path: "logic.${ext}"
    role: "business-logic"
    description: "Pure functions implementing business rules"
    changes_when: "Business rules change"

  - path: "persistence.${ext}"
    role: "data-access"
    description: "Data storage and retrieval"
    changes_when: "Database schema changes"

  - path: "types.${ext}"
    role: "type-definitions"
    description: "All types specific to this operation"
    changes_when: "Domain model changes"

  - path: "errors.${ext}"
    role: "error-definitions"
    description: "All error types this operation can produce"
    changes_when: "New failure modes identified"

dependencies:
  contracts:
    - "contracts/${name}.contract.yaml"
  capabilities: []
  infrastructure: []
  operations: []

depended_on_by: []

contracts:
  implements: "contracts/${name}.contract.yaml"
  publishes_events: []
  consumes_events: []

change_impact:
  if_input_changes:
    - "Update contracts/${name}.contract.yaml"
    - "Update handler.${ext}"
    - "Update handler.test.${ext}"
  if_business_rules_change:
    - "Update logic.${ext}"
    - "Update logic.test.${ext}"

testing:
  unit_tests:
    - "logic.test.${ext}"
  integration_tests:
    - "handler.test.${ext}"
  coverage_threshold: 80
`);

  // RATIONALE.md
  writeFile(opDir, 'RATIONALE.md', `# Rationale: ${name}

TODO: Document the reasoning behind business rules in this operation.

## Example

### Why [Rule Name]
[Explanation of why this rule exists, what problem it solves,
and what would go wrong without it.]
`);

  // Contract
  writeFile(contractDir, `${name}.contract.yaml`, `contract:
  name: "${name}"
  version: "1.0"
  type: "request-response"
  description: "TODO: Describe this contract"

owner: "TODO"

input:
  type: "object"
  required: []
  properties: {}

output:
  success:
    type: "object"
    properties: {}

errors: []

side_effects: []

invariants: []

examples: []
`);

  // Implementation stubs
  const stubComment = `// TODO: Implement ${name} operation`;

  writeFile(opDir, `types.${ext}`, `/**
 * @module ${name}/types
 * @role type-definitions
 * @contract contracts/${name}.contract.yaml
 */

// TODO: Define types based on the contract
export interface ${toPascalCase(name)}Input {
}

export interface ${toPascalCase(name)}Output {
}
`);

  writeFile(opDir, `errors.${ext}`, `/**
 * @module ${name}/errors
 * @role error-definitions
 * @contract contracts/${name}.contract.yaml
 */

// TODO: Define error classes based on the contract errors section
`);

  writeFile(opDir, `logic.${ext}`, `/**
 * @module ${name}/logic
 * @role business-logic
 * @contract contracts/${name}.contract.yaml
 *
 * Pure functions implementing business rules.
 * No I/O, no side effects, no database calls.
 */

${stubComment}
`);

  writeFile(opDir, `persistence.${ext}`, `/**
 * @module ${name}/persistence
 * @role data-access
 * @contract contracts/${name}.contract.yaml
 *
 * Data storage and retrieval functions.
 */

${stubComment}
`);

  writeFile(opDir, `handler.${ext}`, `/**
 * @module ${name}/handler
 * @role entry-point
 * @contract contracts/${name}.contract.yaml
 *
 * Entry point for this operation.
 * Validates input, calls logic, persists, returns response.
 *
 * CHANGE THIS FILE WHEN: Request/response shape changes
 * DO NOT PUT BUSINESS LOGIC HERE. That belongs in logic.${ext}.
 */

${stubComment}
`);

  writeFile(opDir, `logic.test.${ext}`, `/**
 * @test-for logic.${ext}
 * @test-type unit
 * @contract contracts/${name}.contract.yaml
 * @mocks none (pure functions)
 */

import { describe, it, expect } from 'vitest';

describe('${name} logic', () => {
  // TODO: Add tests based on contract examples and error cases
  it.todo('should handle the happy path');
});
`);

  writeFile(opDir, `handler.test.${ext}`, `/**
 * @test-for handler.${ext}
 * @test-type integration
 * @contract contracts/${name}.contract.yaml
 */

import { describe, it, expect } from 'vitest';

describe('${name} handler', () => {
  // TODO: Add integration tests
  it.todo('should handle a valid request');
});
`);
}

function writeFile(dir: string, filename: string, content: string): void {
  const filePath = path.join(dir, filename);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf-8');
}

function toPascalCase(str: string): string {
  return str
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}
