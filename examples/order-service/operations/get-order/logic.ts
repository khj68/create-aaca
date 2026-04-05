import type { Order } from '../create-order/types';
import type { GetOrderOutput } from './types';

/**
 * Formats a raw order record from the database into the API response shape.
 *
 * Pure function: transforms data without side effects.
 * This separation allows the response format to change independently
 * of the persistence schema.
 */
export function formatOrderResponse(order: Order): GetOrderOutput {
  return {
    order_id: order.id,
    customer_id: order.customer_id,
    status: order.status,
    items: order.items,
    pricing: order.pricing,
    payment_method_id: order.payment_method_id,
    estimated_delivery: order.estimated_delivery,
    created_at: order.created_at,
  };
}
