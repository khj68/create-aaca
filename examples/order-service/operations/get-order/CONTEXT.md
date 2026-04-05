# Get Order Operation

## What It Does

Retrieves an existing order by its unique identifier. This is a read-only
operation that returns the full order details including items, pricing,
status, and delivery estimate.

## When to Modify This Operation

- Adding new fields to the order response
- Changing how order data is formatted for the response
- Adding authorization checks (e.g., customer can only view their own orders)

## When NOT to Modify This Operation

- Changing order creation logic (that is create-order)
- Modifying database connection settings (that is infrastructure/postgres)
- Changing the HTTP route or response format (that is entry-points/http)

## Data Flow

```
HTTP GET /orders/:id
  |
  v
entry-points/http/router.ts  -->  handler.ts
                                      |
                                      v
                                 persistence (getOrderById)
                                      |
                                      v
                                 logic.ts (formatOrderResponse)
                                      |
                                      v
                                 GetOrderOutput
```
