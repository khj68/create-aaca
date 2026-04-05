import type { GetOrderInput, GetOrderOutput } from './types';
import { OrderNotFoundError } from './types';
import { formatOrderResponse } from './logic';
import type { Order } from '../create-order/types';

// ---------------------------------------------------------------------------
// Persistence stub -- in a real implementation, this would be in a separate
// persistence.ts file using the postgres infrastructure module.
// ---------------------------------------------------------------------------

async function getOrderById(orderId: string): Promise<Order | null> {
  // TODO: Replace with actual database query:
  //
  //   SELECT id, customer_id, items, pricing, payment_method_id,
  //          status, estimated_delivery, created_at
  //   FROM orders
  //   WHERE id = $1

  console.log(`[persistence] getOrderById called with orderId=${orderId}`);
  return null;
}

/**
 * Handles the get-order operation.
 *
 * Fetches the order from the database and formats it for the API response.
 * Throws OrderNotFoundError if the order does not exist.
 */
export async function handleGetOrder(
  input: GetOrderInput,
): Promise<GetOrderOutput> {
  const order = await getOrderById(input.order_id);

  if (order === null) {
    throw new OrderNotFoundError(input.order_id);
  }

  return formatOrderResponse(order);
}
