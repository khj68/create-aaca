# Event Publishing Capability

## What It Does

Provides a domain event publishing interface used by operations to notify
downstream consumers of state changes. Currently publishes via the
transactional outbox pattern (see DECISIONS.yaml ADR-003).

## When to Modify

- Adding new event types
- Changing the publishing mechanism (e.g., switching from outbox to direct Kafka)
- Adding event validation or schema enforcement
- Adding retry or dead-letter logic

## When NOT to Modify

- Adding business logic (that belongs in operations)
- Changing which events are published (that is the operation's handler.ts)

## Consumers

- `operations/create-order/handler.ts` -- publishes `order.confirmed`
