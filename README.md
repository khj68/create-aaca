# AACA - AI-Agent Centric Architecture

> Beyond Layered. Beyond Hexagonal. Architecture for the Age of AI Agents.

[![npm version](https://img.shields.io/npm/v/create-aaca)](https://www.npmjs.com/package/create-aaca)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

[한국어 README](./README.ko.md)

Traditional software architectures (Layered, Hexagonal, Clean) were designed for **human cognition** — small files, implicit conventions, abstract layers. AACA is designed for **AI agent cognition** — explicit manifests, self-contained modules, and deterministic discovery.

---

## If You Are an AI Agent

Read these files in order:

```
1. SYSTEM.manifest.yaml   → What this system does (operations, capabilities, infrastructure)
2. GLOSSARY.yaml           → What domain terms mean
3. DECISIONS.yaml          → What constraints you must respect
4. operations/{name}/MODULE.manifest.yaml → Files, dependencies, change impact
5. operations/{name}/CONTEXT.md           → What to modify, what not to
6. contracts/{name}.contract.yaml         → Input/output/errors/side effects
7. operations/{name}/RATIONALE.md         → Why business rules exist
```

After reading these 7 files, you have **complete context**. No exploration needed.

### Quick Reference for Common Tasks

| Task | Start Here |
|------|-----------|
| Add a new feature | `SYSTEM.manifest.yaml` → `_aaca/templates/new-operation/` |
| Fix a bug | `SYSTEM.manifest.yaml` → find the operation → its `MODULE.manifest.yaml` |
| Add a new API endpoint | `entry-points/http/routes.manifest.yaml` → create new operation |
| Change business rules | operation's `logic.{ext}` (check `RATIONALE.md` first) |
| Add a database table | `infrastructure/{db}/CONTEXT.md` |
| Understand an error | operation's `errors.{ext}` + `contract.yaml` |

### Rules for AI Agents

1. **Never modify files outside the target operation directory** without checking `MODULE.manifest.yaml` dependencies
2. **Always read the contract** before implementing changes
3. **Update `MODULE.manifest.yaml`** when adding/removing files
4. **Update `SYSTEM.manifest.yaml`** when adding/removing operations
5. **Check `DECISIONS.yaml`** before making architectural choices

---

## If You Are a Human Developer

### What is AACA?

AACA organizes code by **what the system does** (operations), not by **technical layers** (controller/service/repository). Each operation is a self-contained directory with everything needed to understand it.

```
# Traditional (7 files across 7 directories to understand "create order")
controllers/OrderController.ts
services/OrderService.ts
repositories/OrderRepository.ts
models/Order.ts
dto/CreateOrderRequest.ts
dto/CreateOrderResponse.ts
mappers/OrderMapper.ts

# AACA (1 directory, everything together)
operations/create-order/
  ├── CONTEXT.md              # What this does, when to modify
  ├── MODULE.manifest.yaml    # All files, dependencies, change impact
  ├── RATIONALE.md            # Why decisions were made
  ├── handler.ts              # Entry point
  ├── logic.ts                # Pure business logic
  ├── persistence.ts          # Data access
  ├── types.ts                # Types for this operation
  ├── errors.ts               # Errors for this operation
  └── *.test.ts               # Co-located tests
```

### The 7 Principles

| # | Principle | What It Means |
|---|-----------|---------------|
| 1 | **Manifest Over Convention** | Don't rely on naming or folder placement. Declare everything in YAML manifests. |
| 2 | **Context At Every Level** | Every directory has a `CONTEXT.md` explaining its purpose. |
| 3 | **Operations Over Layers** | Organize by what the system does, not by technical role. |
| 4 | **Contracts Before Code** | Define input/output/errors in a contract before writing implementation. |
| 5 | **Self-Contained Modules** | One directory = everything you need. No cross-directory scavenger hunts. |
| 6 | **Explicit Change Boundaries** | `MODULE.manifest.yaml` tells you exactly what files change for each type of requirement. |
| 7 | **Rationale As Code** | Design decisions live in the repo, not in wikis or Slack. |

### Quick Start

```bash
# Create a new AACA project
npx create-aaca init my-service --lang typescript

# Validate your project structure
npx create-aaca validate

# Add a new operation
npx create-aaca add-operation my-new-feature
```

### Project Structure

```
my-service/
├── SYSTEM.manifest.yaml      # System entry point (start here)
├── CONTEXT.md                 # Project-level context
├── DECISIONS.yaml             # Architectural decisions
├── GLOSSARY.yaml              # Domain terminology
│
├── contracts/                 # All inter-module contracts
│   └── {name}.contract.yaml
│
├── operations/                # One directory per operation
│   └── {name}/
│       ├── MODULE.manifest.yaml
│       ├── CONTEXT.md
│       ├── RATIONALE.md
│       ├── handler.{ext}
│       ├── logic.{ext}
│       └── *.test.{ext}
│
├── capabilities/              # Cross-cutting concerns (auth, events, etc.)
│   └── {name}/
│
├── infrastructure/            # External system bindings (DB, queues)
│   └── {name}/
│
├── entry-points/              # HTTP, CLI, events, scheduled
│   └── {type}/
│
└── _aaca/                     # Validation tools and templates
    ├── validate.{ext}
    └── templates/
```

---

## Why AACA?

### For AI Agents
- **Deterministic discovery**: 7 files, always in the same place, always the same format
- **Zero tribal knowledge required**: Everything is declared, nothing is implicit
- **Precise change boundaries**: Manifests declare exactly what changes for each requirement type
- **Contract-driven**: Exhaustive error catalogs, side effect declarations, invariants

### For Human Developers
- **Feature cohesion**: Everything about "create order" is in `operations/create-order/`
- **Onboarding speed**: Read `SYSTEM.manifest.yaml` and you know the entire system
- **Safer refactoring**: Contracts and manifests catch breaking changes
- **Living documentation**: `RATIONALE.md` and `DECISIONS.yaml` are always up to date

### vs Existing Architectures

| Aspect | Clean/Hexagonal | Vertical Slice | AACA |
|--------|----------------|----------------|------|
| Organization | Technical layers | Feature folders | Operations + manifests |
| Discovery | Explore & infer | Explore & infer | Deterministic protocol |
| Context | External docs | README maybe | CONTEXT.md everywhere |
| Contracts | Interfaces in code | None standard | YAML schemas with errors/side effects |
| Change impact | Trace dependencies | Guess | Declared in manifest |
| Rationale | ADR docs (maybe) | None standard | RATIONALE.md per operation |

---

## Examples

See [`examples/order-service/`](./examples/order-service/) for a complete TypeScript implementation.

## Documentation

- [Philosophy & Principles](./docs/philosophy.md)
- [Getting Started](./docs/getting-started.md)
- [Manifest Specification](./docs/manifests.md)
- [Contract Specification](./docs/contracts.md)
- [Comparison with Existing Architectures](./docs/vs-existing.md)
- [FAQ](./docs/faq.md)

## Installation

### 1. CLI Tool (npx)

```bash
# Create a new AACA project
npx create-aaca init my-service --lang typescript

# Add an operation to existing project
npx create-aaca add-operation checkout

# Validate project structure
npx create-aaca validate
```

### 2. Claude Code Skill

```bash
# Option A: Auto-install via npx
npx create-aaca install-skill

# Option B: Manual copy
cp skill/SKILL.md ~/.claude/skills/aaca.md
```

After installation, type `/aaca` in Claude Code to get started.

### 3. For Contributors

```bash
git clone https://github.com/khj68/create-aaca.git
cd create-aaca
npm install
npm run build
npm publish    # publishes as 'create-aaca' to npm
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

MIT
