/**
 * Supported domain event names.
 */
export type EventName =
  | 'order.confirmed'
  | 'order.cancelled'
  | 'order.shipped';

/**
 * A domain event as stored in the outbox table.
 */
export interface DomainEvent {
  /** Unique event identifier. */
  id: string;
  /** The event name (e.g., "order.confirmed"). */
  name: EventName;
  /** The event payload (JSON-serializable). */
  payload: Record<string, unknown>;
  /** ISO 8601 timestamp of when the event was created. */
  created_at: string;
  /** Whether the event has been published to the message broker. */
  published: boolean;
  /** ISO 8601 timestamp of when the event was published (null if not yet). */
  published_at: string | null;
}

/**
 * Payload shape for the order.confirmed event.
 */
export interface OrderConfirmedPayload {
  order_id: string;
  customer_id: string;
  items: Array<{
    item_id: string;
    name: string;
    quantity: number;
    price_cents: number;
  }>;
  pricing: {
    subtotal_cents: number;
    discount_cents: number;
    tax_cents: number;
    total_cents: number;
  };
  created_at: string;
}
