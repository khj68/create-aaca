# Order Service - AACA Example

This is a complete example of an order management service built following the
**Agent-Augmented Code Architecture (AACA)** pattern.

## What This Service Does

Manages customer orders: creating new orders from shopping carts and retrieving
existing orders. The service validates cart contents, checks inventory,
calculates pricing with optional discount codes, persists the order, and
publishes domain events for downstream consumers (e.g., fulfillment, analytics).

## What This Example Demonstrates

- **SYSTEM.manifest.yaml** as the single entry point for understanding the system
- **Contracts** defined before implementation, serving as the source of truth
- **Operations** as the primary unit of organization (not layers or entities)
- **Pure logic** separated from side effects (logic.ts vs handler.ts)
- **Shared types** defined once in contracts/shared-types/
- **Capabilities** (event publishing) decoupled from operations
- **Infrastructure** (postgres) isolated behind clear boundaries
- **Entry points** (HTTP) as thin adapters that delegate to operations
- **CONTEXT.md** files providing navigation guidance at every level
- **MODULE.manifest.yaml** files declaring dependencies and change impact
- **DECISIONS.yaml** capturing architectural rationale
- **GLOSSARY.yaml** aligning domain terminology

## Directory Structure

```
order-service/
  SYSTEM.manifest.yaml      # System-level manifest (start here)
  CONTEXT.md                 # This file
  DECISIONS.yaml             # Architectural decision records
  GLOSSARY.yaml              # Domain terminology
  contracts/                 # Inter-module contracts and shared types
  operations/                # Business operations (the core)
    create-order/            # Order creation operation
    get-order/               # Order retrieval operation
  capabilities/              # Cross-cutting capabilities
    event-publishing/        # Domain event publishing
  infrastructure/            # Infrastructure adapters
    postgres/                # PostgreSQL database layer
  entry-points/              # External interface adapters
    http/                    # REST HTTP server
  _aaca/                     # Architecture validation tooling
```

## How an Agent Should Navigate This Codebase

1. Start with `SYSTEM.manifest.yaml` to see all operations, capabilities, and infrastructure.
2. Read `GLOSSARY.yaml` to understand domain terms.
3. Read the relevant `contracts/*.contract.yaml` to understand inputs, outputs, and errors.
4. Navigate to the specific `operations/*/` directory for implementation details.
5. Read `CONTEXT.md` in any directory for local guidance.
