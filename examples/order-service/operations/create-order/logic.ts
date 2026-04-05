import type { CartItem, Pricing } from './types';
import { CartEmptyError, InsufficientInventoryError, InvalidDiscountCodeError } from './errors';

/**
 * Known discount codes and their discount percentages.
 * In a real system, this would be fetched from a database or external service.
 */
const DISCOUNT_CODES: Record<string, number> = {
  SAVE10: 10,
  SAVE20: 20,
  HALF50: 50,
};

/** Tax rate as a decimal (e.g., 0.08 = 8%). */
const TAX_RATE = 0.08;

/**
 * Validates that a cart has items and all items have sufficient inventory.
 *
 * Pure function: throws on invalid state, returns void on success.
 *
 * @throws {CartEmptyError} if items array is empty
 * @throws {InsufficientInventoryError} if any item exceeds available inventory
 */
export function validateCart(
  items: CartItem[],
  inventory: Map<string, number>,
): void {
  if (items.length === 0) {
    throw new CartEmptyError();
  }

  const insufficientItems: Array<{ item_id: string; requested: number; available: number }> = [];

  for (const item of items) {
    const available = inventory.get(item.item_id) ?? 0;
    if (item.quantity > available) {
      insufficientItems.push({
        item_id: item.item_id,
        requested: item.quantity,
        available,
      });
    }
  }

  if (insufficientItems.length > 0) {
    throw new InsufficientInventoryError(insufficientItems);
  }
}

/**
 * Calculates pricing from cart items.
 *
 * Pure function: computes subtotal, applies tax, returns pricing breakdown.
 * Discount is initially zero; use applyDiscount() to modify.
 */
export function calculatePricing(items: CartItem[]): Pricing {
  const subtotal_cents = items.reduce(
    (sum, item) => sum + item.price_cents * item.quantity,
    0,
  );

  const tax_cents = Math.round(subtotal_cents * TAX_RATE);

  return {
    subtotal_cents,
    discount_cents: 0,
    tax_cents,
    total_cents: subtotal_cents + tax_cents,
  };
}

/**
 * Applies a discount code to an existing pricing breakdown.
 *
 * Pure function: returns a new Pricing object with the discount applied.
 * The discount is applied to the subtotal, and tax is recalculated on the
 * discounted amount.
 *
 * @throws {InvalidDiscountCodeError} if the code is not recognized
 */
export function applyDiscount(pricing: Pricing, discountCode: string): Pricing {
  const percentage = DISCOUNT_CODES[discountCode];

  if (percentage === undefined) {
    throw new InvalidDiscountCodeError(discountCode);
  }

  const discount_cents = Math.round(pricing.subtotal_cents * (percentage / 100));
  const discountedSubtotal = pricing.subtotal_cents - discount_cents;
  const tax_cents = Math.round(discountedSubtotal * TAX_RATE);

  return {
    subtotal_cents: pricing.subtotal_cents,
    discount_cents,
    tax_cents,
    total_cents: discountedSubtotal + tax_cents,
  };
}

/**
 * Calculates an estimated delivery date (7 days from now).
 *
 * Pure function: deterministic given the same input date.
 */
export function estimateDelivery(fromDate: Date = new Date()): string {
  const delivery = new Date(fromDate);
  delivery.setDate(delivery.getDate() + 7);
  return delivery.toISOString().split('T')[0];
}
