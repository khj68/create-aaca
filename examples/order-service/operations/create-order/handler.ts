import type { CreateOrderInput, CreateOrderOutput } from './types';
import { CartNotFoundError } from './errors';
import { validateCart, calculatePricing, applyDiscount, estimateDelivery } from './logic';
import {
  getCartItems,
  getInventory,
  saveOrder,
  markCartConverted,
  markDiscountCodeUsed,
} from './persistence';
import { publish } from '../../capabilities/event-publishing/provider';

/**
 * Handles the create-order operation.
 *
 * This is the orchestrator that wires together:
 * - persistence.ts for data access
 * - logic.ts for pure business rules
 * - event-publishing capability for domain events
 *
 * Flow:
 * 1. Fetch cart items from the database
 * 2. Fetch inventory levels for all cart items
 * 3. Validate the cart (non-empty, sufficient inventory)
 * 4. Calculate pricing (subtotal, tax)
 * 5. Apply discount code if provided
 * 6. Persist the order (with outbox event in same transaction)
 * 7. Mark cart as converted
 * 8. Mark discount code as used (if applicable)
 * 9. Publish order.confirmed event
 * 10. Return the order summary
 */
export async function handleCreateOrder(
  input: CreateOrderInput,
): Promise<CreateOrderOutput> {
  // Step 1: Fetch cart items
  const items = await getCartItems(input.cart_id);
  if (items === null) {
    throw new CartNotFoundError(input.cart_id);
  }

  // Step 2: Fetch inventory for all items in the cart
  const itemIds = items.map((item) => item.item_id);
  const inventory = await getInventory(itemIds);

  // Step 3: Validate cart (pure logic -- may throw)
  validateCart(items, inventory);

  // Step 4: Calculate pricing (pure logic)
  let pricing = calculatePricing(items);

  // Step 5: Apply discount if provided (pure logic -- may throw)
  if (input.discount_code) {
    pricing = applyDiscount(pricing, input.discount_code);
  }

  // Step 6: Persist the order
  const estimatedDelivery = estimateDelivery();
  const order = await saveOrder({
    customer_id: input.customer_id,
    items,
    pricing,
    payment_method_id: input.payment_method_id,
    status: 'confirmed',
    estimated_delivery: estimatedDelivery,
  });

  // Step 7: Mark cart as converted
  await markCartConverted(input.cart_id);

  // Step 8: Mark discount code as used
  if (input.discount_code) {
    await markDiscountCodeUsed(input.discount_code);
  }

  // Step 9: Publish domain event
  await publish('order.confirmed', {
    order_id: order.id,
    customer_id: order.customer_id,
    items: order.items,
    pricing: order.pricing,
    created_at: order.created_at,
  });

  // Step 10: Return summary
  return {
    order_id: order.id,
    status: order.status,
    total_cents: order.pricing.total_cents,
    estimated_delivery: order.estimated_delivery,
  };
}
