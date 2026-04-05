# Create Order -- Business Rule Rationale

## Why Cart Validation Happens at Order Time

Cart contents can change between when the customer last viewed their cart and
when they click "Place Order." Items may go out of stock, prices may change,
or the cart may have been emptied from another session. Therefore, we
re-validate the entire cart at order creation time rather than trusting
cached state.

This means:
- We fetch fresh cart items from the database (not from a client-side cache).
- We check inventory availability at the moment of order creation.
- We accept the small performance cost of re-validation for the guarantee
  of data consistency.

## Why Pricing Is Recalculated (Not Taken from Cart)

The cart service may display estimated prices, but the order service is the
authoritative source for final pricing. Prices can change between cart display
and order placement. Recalculating ensures:

- The customer is charged the correct current price.
- Tax calculations reflect the latest tax rules.
- Discount application follows the latest discount rules.
- There is no way to manipulate pricing by modifying client-side cart data.

## Why Discount Codes Are Single-Use

Discount codes are consumed atomically within the order creation transaction.
This prevents:

- Race conditions where two concurrent orders use the same code.
- Replay attacks where a code is reused after a failed order attempt.
- Accounting discrepancies from double-applied discounts.

The discount code is marked as consumed in the same database transaction that
creates the order. If the transaction rolls back, the code remains available.

## Why We Use a Transactional Outbox (Not Direct Event Publishing)

See DECISIONS.yaml ADR-003 for the full architectural decision record. In
short: we need atomicity between persisting the order and publishing the
order.confirmed event. The outbox pattern achieves this without distributed
transactions.
