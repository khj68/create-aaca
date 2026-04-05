export class CartEmptyError extends Error {
  readonly code = 'CART_EMPTY' as const;
  readonly httpStatus = 400;
  constructor() {
    super('Cart has no items');
    this.name = 'CartEmptyError';
  }
}

export class CartNotFoundError extends Error {
  readonly code = 'CART_NOT_FOUND' as const;
  readonly httpStatus = 404;
  constructor(cartId: string) {
    super(`Cart ${cartId} not found`);
    this.name = 'CartNotFoundError';
  }
}

export class InsufficientInventoryError extends Error {
  readonly code = 'INSUFFICIENT_INVENTORY' as const;
  readonly httpStatus = 409;
  readonly items: Array<{ item_id: string; requested: number; available: number }>;
  constructor(items: Array<{ item_id: string; requested: number; available: number }>) {
    super('Insufficient inventory for one or more items');
    this.name = 'InsufficientInventoryError';
    this.items = items;
  }
}

export class InvalidDiscountCodeError extends Error {
  readonly code = 'INVALID_DISCOUNT_CODE' as const;
  readonly httpStatus = 400;
  constructor(code: string) {
    super(`Invalid discount code: ${code}`);
    this.name = 'InvalidDiscountCodeError';
  }
}

export class PaymentMethodInvalidError extends Error {
  readonly code = 'PAYMENT_METHOD_INVALID' as const;
  readonly httpStatus = 402;
  constructor() {
    super('Payment method is invalid or cannot be charged');
    this.name = 'PaymentMethodInvalidError';
  }
}
