# Contracts Directory

This directory holds all inter-module contracts for the order service. Contracts
are the source of truth for what each operation accepts, returns, and guarantees.

## Purpose

- Define inputs, outputs, and error codes for every operation
- Establish invariants that must hold before and after execution
- Provide concrete examples for testing and documentation
- House shared type schemas used across multiple contracts

## Rules

- Contracts are written BEFORE implementation code.
- Changing a contract is a breaking change -- update consumers first.
- Shared types live in `shared-types/` and are referenced by contracts.
- Every error code in a contract must have a corresponding error class in the
  operation's `errors.ts`.

## Files

- `create-order.contract.yaml` -- Contract for the create-order operation
- `get-order.contract.yaml` -- Contract for the get-order operation
- `shared-types/` -- Reusable type schemas (money, address, etc.)
