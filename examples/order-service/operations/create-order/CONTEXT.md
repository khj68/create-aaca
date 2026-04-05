# Create Order Operation

## What It Does

Converts a shopping cart into a confirmed order. This is the most critical
operation in the order service -- it validates the cart, checks inventory,
calculates pricing, applies optional discounts, persists the order, and
publishes an order.confirmed domain event.

## When to Modify This Operation

- Adding new validation rules (e.g., minimum order amount)
- Changing pricing calculation (e.g., new tax rules)
- Adding new discount types
- Modifying the order.confirmed event payload
- Adding new side effects to order creation

## When NOT to Modify This Operation

- Changing how orders are retrieved (that is get-order)
- Modifying the HTTP request/response format (that is entry-points/http)
- Changing event publishing infrastructure (that is capabilities/event-publishing)
- Modifying database connection settings (that is infrastructure/postgres)

## Data Flow

```
HTTP Request
  |
  v
entry-points/http/router.ts  -->  handler.ts (orchestrator)
                                      |
                        +-------------+-------------+
                        |             |             |
                        v             v             v
                   persistence.ts  logic.ts   capabilities/
                   (get cart,      (validate,   event-publishing/
                    save order,     calculate,   (publish
                    get inventory)  apply         order.confirmed)
                                    discount)
                        |
                        v
                   infrastructure/
                   postgres/
                   (actual DB calls)
```

## File Responsibilities

| File | Pure? | Responsibility |
|------|-------|----------------|
| types.ts | Yes | Data structures for this operation |
| errors.ts | Yes | Error classes with codes from the contract |
| logic.ts | Yes | Business rules: validation, pricing, discounts |
| persistence.ts | No | Database reads and writes |
| handler.ts | No | Orchestrates logic + persistence + events |
| logic.test.ts | -- | Unit tests for logic.ts |
| handler.test.ts | -- | Integration tests with mocked dependencies |
