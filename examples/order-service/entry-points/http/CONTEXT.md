# HTTP Entry Point

## What It Does

Exposes REST HTTP endpoints that map incoming requests to operation handlers.
This is a thin adapter layer -- it handles HTTP concerns (request parsing,
response formatting, status codes) and delegates all business logic to operations.

## When to Modify

- Adding new HTTP routes for new operations
- Changing request/response serialization
- Adding middleware (authentication, rate limiting, CORS)
- Modifying error-to-HTTP-status mapping

## When NOT to Modify

- Changing business logic (that belongs in operations)
- Changing data access patterns (that belongs in operation persistence files)
- Modifying event publishing (that belongs in capabilities)

## Routes

| Method | Path           | Operation      | Handler                              |
|--------|----------------|----------------|--------------------------------------|
| POST   | /orders        | create-order   | operations/create-order/handler.ts   |
| GET    | /orders/:id    | get-order      | operations/get-order/handler.ts      |
| GET    | /health        | (infrastructure)| infrastructure/postgres/health.ts   |
