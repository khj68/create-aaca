import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleCreateOrder } from './handler';
import { CartNotFoundError, CartEmptyError, InvalidDiscountCodeError } from './errors';
import type { CartItem } from './types';

// ---------------------------------------------------------------------------
// Mock persistence
// ---------------------------------------------------------------------------
vi.mock('./persistence', () => ({
  getCartItems: vi.fn(),
  getInventory: vi.fn(),
  saveOrder: vi.fn(),
  markCartConverted: vi.fn(),
  markDiscountCodeUsed: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Mock event publishing
// ---------------------------------------------------------------------------
vi.mock('../../capabilities/event-publishing/provider', () => ({
  publish: vi.fn(),
}));

import {
  getCartItems,
  getInventory,
  saveOrder,
  markCartConverted,
  markDiscountCodeUsed,
} from './persistence';
import { publish } from '../../capabilities/event-publishing/provider';

const mockGetCartItems = vi.mocked(getCartItems);
const mockGetInventory = vi.mocked(getInventory);
const mockSaveOrder = vi.mocked(saveOrder);
const mockMarkCartConverted = vi.mocked(markCartConverted);
const mockMarkDiscountCodeUsed = vi.mocked(markDiscountCodeUsed);
const mockPublish = vi.mocked(publish);

const sampleItems: CartItem[] = [
  { item_id: 'item-001', name: 'Mechanical Keyboard', quantity: 1, price_cents: 5000 },
  { item_id: 'item-002', name: 'USB Cable', quantity: 2, price_cents: 1000 },
];

const sufficientInventory = new Map<string, number>([
  ['item-001', 10],
  ['item-002', 50],
]);

const baseInput = {
  cart_id: 'cart-001',
  customer_id: 'cust-001',
  payment_method_id: 'pm-001',
};

beforeEach(() => {
  vi.clearAllMocks();

  // Default happy-path mocks
  mockGetCartItems.mockResolvedValue(sampleItems);
  mockGetInventory.mockResolvedValue(sufficientInventory);
  mockSaveOrder.mockImplementation(async (order) => ({
    ...order,
    id: 'ord-test-001',
    created_at: '2025-11-20T14:30:00Z',
  }));
  mockMarkCartConverted.mockResolvedValue(undefined);
  mockMarkDiscountCodeUsed.mockResolvedValue(undefined);
  mockPublish.mockResolvedValue(undefined);
});

describe('handleCreateOrder', () => {
  it('should create an order successfully without discount', async () => {
    const result = await handleCreateOrder(baseInput);

    expect(result.order_id).toBe('ord-test-001');
    expect(result.status).toBe('confirmed');
    // subtotal 7000 + tax 560 = 7560
    expect(result.total_cents).toBe(7560);
    expect(result.estimated_delivery).toBeDefined();
  });

  it('should create an order with a valid discount code', async () => {
    const result = await handleCreateOrder({
      ...baseInput,
      discount_code: 'SAVE20',
    });

    expect(result.order_id).toBe('ord-test-001');
    // subtotal 7000, discount 1400, discounted subtotal 5600, tax 448
    expect(result.total_cents).toBe(6048);
  });

  it('should throw CartNotFoundError when cart does not exist', async () => {
    mockGetCartItems.mockResolvedValue(null);

    await expect(handleCreateOrder(baseInput)).rejects.toThrow(CartNotFoundError);
  });

  it('should throw CartEmptyError when cart has no items', async () => {
    mockGetCartItems.mockResolvedValue([]);

    await expect(handleCreateOrder(baseInput)).rejects.toThrow(CartEmptyError);
  });

  it('should throw InvalidDiscountCodeError for bad discount code', async () => {
    await expect(
      handleCreateOrder({ ...baseInput, discount_code: 'NOTREAL' }),
    ).rejects.toThrow(InvalidDiscountCodeError);
  });

  it('should persist the order via saveOrder', async () => {
    await handleCreateOrder(baseInput);

    expect(mockSaveOrder).toHaveBeenCalledOnce();
    expect(mockSaveOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        customer_id: 'cust-001',
        payment_method_id: 'pm-001',
        status: 'confirmed',
        items: sampleItems,
      }),
    );
  });

  it('should mark the cart as converted', async () => {
    await handleCreateOrder(baseInput);

    expect(mockMarkCartConverted).toHaveBeenCalledWith('cart-001');
  });

  it('should mark the discount code as used when provided', async () => {
    await handleCreateOrder({ ...baseInput, discount_code: 'SAVE10' });

    expect(mockMarkDiscountCodeUsed).toHaveBeenCalledWith('SAVE10');
  });

  it('should not mark discount code when none is provided', async () => {
    await handleCreateOrder(baseInput);

    expect(mockMarkDiscountCodeUsed).not.toHaveBeenCalled();
  });

  it('should publish an order.confirmed event', async () => {
    await handleCreateOrder(baseInput);

    expect(mockPublish).toHaveBeenCalledWith(
      'order.confirmed',
      expect.objectContaining({
        order_id: 'ord-test-001',
        customer_id: 'cust-001',
      }),
    );
  });
});
