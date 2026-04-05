# AACA Templates

This directory contains templates for creating new modules following the AACA
architecture pattern. When adding a new operation, capability, or infrastructure
module, copy the relevant template and fill in the placeholders.

## Available Templates

Currently this directory serves as a placeholder for future templates:

- **Operation template** -- CONTEXT.md, MODULE.manifest.yaml, types.ts,
  errors.ts, logic.ts, persistence.ts, handler.ts, logic.test.ts, handler.test.ts
- **Capability template** -- CONTEXT.md, MODULE.manifest.yaml, types.ts, provider.ts
- **Infrastructure template** -- CONTEXT.md, MODULE.manifest.yaml, connection.ts, health.ts
- **Contract template** -- {operation}.contract.yaml with input, output, errors,
  side_effects, invariants, and examples sections

## Usage

An agent or developer adding a new operation should:

1. Copy the operation template directory
2. Rename it to the new operation name
3. Fill in all placeholder values
4. Create the corresponding contract in `contracts/`
5. Register the operation in `SYSTEM.manifest.yaml`
6. Wire the HTTP route in `entry-points/http/router.ts`
7. Run `_aaca/validate.ts` to confirm structural integrity
