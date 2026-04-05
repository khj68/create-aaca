# Operations Directory

Operations are the primary organizational unit in this service. Each subdirectory
represents a single business operation with its own types, logic, persistence,
handler, and tests.

## Structure of Each Operation

```
operation-name/
  CONTEXT.md               # What this operation does, when to modify
  MODULE.manifest.yaml     # Dependencies, files, change impact
  types.ts                 # Input/output types and internal data structures
  errors.ts                # Operation-specific error classes
  logic.ts                 # Pure business logic (no side effects)
  persistence.ts           # Data access functions
  handler.ts               # Orchestrator (wires logic + persistence + capabilities)
  logic.test.ts            # Unit tests for pure logic
  handler.test.ts          # Integration tests for the handler
```

## Key Principles

- **logic.ts** contains ONLY pure functions. No database calls, no event
  publishing, no I/O of any kind. This makes business rules easy to test.
- **handler.ts** orchestrates logic.ts, persistence.ts, and capabilities.
  It is the only file that coordinates side effects.
- **persistence.ts** isolates all database access behind typed functions.
- **errors.ts** defines error classes with codes matching the contract.

## Operations

- `create-order/` -- Creates a confirmed order from a shopping cart
- `get-order/` -- Retrieves an existing order by ID
