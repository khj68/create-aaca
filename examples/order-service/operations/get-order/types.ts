import type { CartItem, Pricing } from '../create-order/types';

export interface GetOrderInput {
  order_id: string;
}

export interface GetOrderOutput {
  order_id: string;
  customer_id: string;
  status: string;
  items: CartItem[];
  pricing: Pricing;
  payment_method_id: string;
  estimated_delivery: string;
  created_at: string;
}

export class OrderNotFoundError extends Error {
  readonly code = 'ORDER_NOT_FOUND' as const;
  readonly httpStatus = 404;
  constructor(orderId: string) {
    super(`Order ${orderId} not found`);
    this.name = 'OrderNotFoundError';
  }
}
