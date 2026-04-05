import { describe, it, expect } from 'vitest';
import { validateCart, calculatePricing, applyDiscount, estimateDelivery } from './logic';
import { CartEmptyError, InsufficientInventoryError, InvalidDiscountCodeError } from './errors';
import type { CartItem } from './types';

const sampleItems: CartItem[] = [
  { item_id: 'item-001', name: 'Mechanical Keyboard', quantity: 1, price_cents: 5000 },
  { item_id: 'item-002', name: 'USB Cable', quantity: 2, price_cents: 1000 },
];

const sufficientInventory = new Map<string, number>([
  ['item-001', 10],
  ['item-002', 50],
]);

describe('validateCart', () => {
  it('should throw CartEmptyError when cart has no items', () => {
    expect(() => validateCart([], new Map())).toThrow(CartEmptyError);
  });

  it('should not throw for a valid cart with sufficient inventory', () => {
    expect(() => validateCart(sampleItems, sufficientInventory)).not.toThrow();
  });

  it('should throw InsufficientInventoryError when inventory is low', () => {
    const lowInventory = new Map<string, number>([
      ['item-001', 0],
      ['item-002', 50],
    ]);

    try {
      validateCart(sampleItems, lowInventory);
      expect.unreachable('Should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(InsufficientInventoryError);
      const error = err as InsufficientInventoryError;
      expect(error.items).toHaveLength(1);
      expect(error.items[0]).toEqual({
        item_id: 'item-001',
        requested: 1,
        available: 0,
      });
    }
  });

  it('should report multiple insufficient items', () => {
    const emptyInventory = new Map<string, number>();

    try {
      validateCart(sampleItems, emptyInventory);
      expect.unreachable('Should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(InsufficientInventoryError);
      const error = err as InsufficientInventoryError;
      expect(error.items).toHaveLength(2);
    }
  });
});

describe('calculatePricing', () => {
  it('should calculate subtotal as sum of (price_cents * quantity)', () => {
    const pricing = calculatePricing(sampleItems);
    // 5000 * 1 + 1000 * 2 = 7000
    expect(pricing.subtotal_cents).toBe(7000);
  });

  it('should calculate tax at 8%', () => {
    const pricing = calculatePricing(sampleItems);
    // 7000 * 0.08 = 560
    expect(pricing.tax_cents).toBe(560);
  });

  it('should set discount to zero', () => {
    const pricing = calculatePricing(sampleItems);
    expect(pricing.discount_cents).toBe(0);
  });

  it('should calculate total as subtotal + tax', () => {
    const pricing = calculatePricing(sampleItems);
    expect(pricing.total_cents).toBe(7000 + 560);
  });

  it('should handle empty items (zero total)', () => {
    // Note: validation prevents this in practice, but the function itself is pure
    const pricing = calculatePricing([]);
    expect(pricing.subtotal_cents).toBe(0);
    expect(pricing.tax_cents).toBe(0);
    expect(pricing.total_cents).toBe(0);
  });
});

describe('applyDiscount', () => {
  const basePricing = calculatePricing(sampleItems);

  it('should apply SAVE20 as a 20% discount on subtotal', () => {
    const discounted = applyDiscount(basePricing, 'SAVE20');
    // 20% of 7000 = 1400
    expect(discounted.discount_cents).toBe(1400);
    // Discounted subtotal = 7000 - 1400 = 5600
    // Tax = 5600 * 0.08 = 448
    expect(discounted.tax_cents).toBe(448);
    expect(discounted.total_cents).toBe(5600 + 448);
  });

  it('should apply SAVE10 as a 10% discount', () => {
    const discounted = applyDiscount(basePricing, 'SAVE10');
    expect(discounted.discount_cents).toBe(700);
  });

  it('should preserve the original subtotal_cents', () => {
    const discounted = applyDiscount(basePricing, 'SAVE20');
    expect(discounted.subtotal_cents).toBe(7000);
  });

  it('should throw InvalidDiscountCodeError for unknown codes', () => {
    expect(() => applyDiscount(basePricing, 'BADCODE')).toThrow(InvalidDiscountCodeError);
  });

  it('should throw InvalidDiscountCodeError for empty string', () => {
    expect(() => applyDiscount(basePricing, '')).toThrow(InvalidDiscountCodeError);
  });
});

describe('estimateDelivery', () => {
  it('should return a date 7 days from the given date', () => {
    const from = new Date('2025-11-20T00:00:00Z');
    expect(estimateDelivery(from)).toBe('2025-11-27');
  });

  it('should handle month boundaries', () => {
    const from = new Date('2025-11-28T00:00:00Z');
    expect(estimateDelivery(from)).toBe('2025-12-05');
  });
});
