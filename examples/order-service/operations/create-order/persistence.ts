import type { CartItem, Order } from './types';

// ---------------------------------------------------------------------------
// Data access functions for the create-order operation.
//
// These functions abstract all database interactions. In a real implementation,
// they would use the postgres connection from infrastructure/postgres/connection.ts.
// Currently stubbed with TODO comments for demonstration purposes.
// ---------------------------------------------------------------------------

/**
 * Retrieves cart items for the given cart ID.
 *
 * @returns The cart items, or null if the cart does not exist.
 */
export async function getCartItems(cartId: string): Promise<CartItem[] | null> {
  // TODO: Replace with actual database query:
  //
  //   SELECT item_id, name, quantity, price_cents
  //   FROM cart_items
  //   WHERE cart_id = $1
  //
  // Return null if the cart does not exist (no rows AND no cart record).
  // Return empty array if the cart exists but has no items.

  console.log(`[persistence] getCartItems called with cartId=${cartId}`);
  return null;
}

/**
 * Retrieves current inventory levels for the given item IDs.
 *
 * @returns A map of item_id -> available quantity.
 */
export async function getInventory(itemIds: string[]): Promise<Map<string, number>> {
  // TODO: Replace with actual database query:
  //
  //   SELECT item_id, available_quantity
  //   FROM inventory
  //   WHERE item_id = ANY($1)
  //
  // Items not found in the inventory table should default to 0.

  console.log(`[persistence] getInventory called with itemIds=${itemIds.join(', ')}`);
  return new Map();
}

/**
 * Persists a new order and writes the order.confirmed event to the outbox,
 * both within a single database transaction.
 *
 * @returns The complete order record with generated id and created_at.
 */
export async function saveOrder(
  order: Omit<Order, 'id' | 'created_at'>,
): Promise<Order> {
  // TODO: Replace with actual transactional insert:
  //
  //   BEGIN;
  //     INSERT INTO orders (id, customer_id, items, pricing, payment_method_id, status, estimated_delivery, created_at)
  //     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
  //     RETURNING *;
  //
  //     INSERT INTO outbox (event_name, payload, created_at)
  //     VALUES ('order.confirmed', $1, NOW());
  //   COMMIT;

  console.log(`[persistence] saveOrder called for customer=${order.customer_id}`);

  return {
    ...order,
    id: `ord-${Date.now()}`,
    created_at: new Date().toISOString(),
  };
}

/**
 * Marks a cart as converted (consumed) after a successful order creation.
 */
export async function markCartConverted(cartId: string): Promise<void> {
  // TODO: Replace with actual database update:
  //
  //   UPDATE carts SET status = 'converted', converted_at = NOW()
  //   WHERE id = $1

  console.log(`[persistence] markCartConverted called with cartId=${cartId}`);
}

/**
 * Marks a discount code as consumed.
 */
export async function markDiscountCodeUsed(code: string): Promise<void> {
  // TODO: Replace with actual database update:
  //
  //   UPDATE discount_codes SET used_at = NOW(), used = true
  //   WHERE code = $1

  console.log(`[persistence] markDiscountCodeUsed called with code=${code}`);
}
