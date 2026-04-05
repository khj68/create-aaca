# Shared Types

Reusable type schemas referenced by multiple contracts. These schemas define
common data structures used across the order service.

## When to Add a New Shared Type

Add a type here when it is used by two or more contracts or operations.
Types used by only a single operation belong in that operation's `types.ts`.

## Files

- `money.schema.yaml` -- Monetary value representation (integer cents)
- `address.schema.yaml` -- Postal address structure
