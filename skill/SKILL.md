---
name: aaca
description: Scaffold and manage AI-Agent Centric Architecture (AACA) projects. Creates operation-based project structures with manifests, contracts, and context files optimized for AI agent comprehension.
---

# AACA - AI-Agent Centric Architecture

You are applying the AACA (AI-Agent Centric Architecture) pattern. AACA organizes code by **operations** (what the system does), not technical layers. Every module is self-contained with manifests, contracts, and context files.

## When the user says `/aaca`

Ask the user what they want to do:

1. **Init** - Create a new AACA project from scratch
2. **Convert** - Convert an existing project to AACA structure
3. **Add Operation** - Add a new operation to an existing AACA project
4. **Add Capability** - Add a new cross-cutting capability
5. **Validate** - Check the project follows AACA conventions

## The 7 Principles

Apply these principles in all AACA work:

1. **Manifest Over Convention** - Create YAML manifests, don't rely on naming conventions
2. **Context At Every Level** - Add CONTEXT.md to every directory you create
3. **Operations Over Layers** - Group by operation (create-order/) not layer (controllers/)
4. **Contracts Before Code** - Define contract YAML before writing implementation
5. **Self-Contained Modules** - Each operation directory has everything: types, logic, persistence, tests
6. **Explicit Change Boundaries** - MODULE.manifest.yaml declares what changes when
7. **Rationale As Code** - Add RATIONALE.md explaining why business rules exist

## Init: New Project

Create this structure:

```
{project-name}/
├── SYSTEM.manifest.yaml      # Entry point for AI agents
├── CONTEXT.md                 # System-level context
├── DECISIONS.yaml             # Architectural decisions
├── GLOSSARY.yaml              # Domain terms
├── contracts/
│   ├── CONTEXT.md
│   └── shared-types/
├── operations/
│   └── CONTEXT.md
├── capabilities/
│   └── CONTEXT.md
├── infrastructure/
│   └── CONTEXT.md
├── entry-points/
│   └── http/
│       ├── CONTEXT.md
│       └── routes.manifest.yaml
└── _aaca/
    └── templates/
```

SYSTEM.manifest.yaml must include:
- system: name, description, version, language, aaca_version
- operations: [] (empty initially)
- capabilities: []
- infrastructure: []
- agent_instructions: on_new_feature, on_bug_fix, on_refactor

## Add Operation

For each new operation, create:

```
operations/{operation-name}/
├── CONTEXT.md                    # What this does, when to modify, data flow
├── MODULE.manifest.yaml          # Files, dependencies, change impact
├── RATIONALE.md                  # Why business rules exist
├── handler.{ext}                 # Entry point (orchestration only)
├── logic.{ext}                   # Pure business logic (no I/O)
├── persistence.{ext}             # Data access
├── types.{ext}                   # Operation-specific types
├── errors.{ext}                  # Operation-specific errors
├── logic.test.{ext}              # Unit tests for pure logic
└── handler.test.{ext}            # Integration tests
```

Also create: `contracts/{operation-name}.contract.yaml` with input/output/errors/side_effects/invariants/examples.

Then update SYSTEM.manifest.yaml to register the operation.

## Convert: Existing Project

When converting an existing project:

1. Read the existing code to understand all features/operations
2. Create SYSTEM.manifest.yaml listing discovered operations
3. For each operation:
   - Create the operation directory
   - Move related code into handler/logic/persistence/types/errors
   - Create MODULE.manifest.yaml, CONTEXT.md, RATIONALE.md
   - Create contract YAML from existing interfaces/types
4. Create GLOSSARY.yaml from domain terms found in code
5. Create DECISIONS.yaml from any ADRs or known architectural decisions
6. Add CONTEXT.md to every directory

## Validate

Check:
- SYSTEM.manifest.yaml exists and is valid
- All referenced operations have directories
- Each operation has MODULE.manifest.yaml and CONTEXT.md
- All referenced contracts exist
- Every directory has CONTEXT.md
- All files declared in MODULE.manifest.yaml exist

## CONTRACT.yaml Format

```yaml
contract:
  name: "{operation-name}"
  version: "1.0"
  type: "request-response"  # or: event, stream
  description: "..."

owner: "{team-name}"

input:
  type: "object"
  required: [...]
  properties: { ... }

output:
  success:
    type: "object"
    properties: { ... }

errors:
  - code: "ERROR_CODE"
    description: "..."
    http_status: 400

side_effects:
  - type: "event"
    name: "EventName"
    when: "On success"

invariants:
  - "Rule that must always hold"

examples:
  - name: "happy path"
    input: { ... }
    output: { ... }
```

## MODULE.manifest.yaml Format

```yaml
module:
  name: "{name}"
  type: "operation"
  description: "..."
  status: "stable"

purpose: |
  Why this module exists.

files:
  - path: "handler.ts"
    role: "entry-point"
    description: "..."
    changes_when: "..."

dependencies:
  contracts: ["contracts/{name}.contract.yaml"]
  capabilities: []
  infrastructure: []

change_impact:
  if_input_changes:
    - "Update contract"
    - "Update handler"
  if_business_rules_change:
    - "Update logic"
    - "Update tests"

testing:
  unit_tests: ["logic.test.ts"]
  integration_tests: ["handler.test.ts"]
  coverage_threshold: 80
```

## AI Agent Discovery Protocol

When working on an AACA project, always follow this reading order:

```
SYSTEM.manifest.yaml → GLOSSARY.yaml → DECISIONS.yaml
→ operations/{name}/MODULE.manifest.yaml → CONTEXT.md
→ contracts/{name}.contract.yaml → RATIONALE.md
→ Implementation files
```
