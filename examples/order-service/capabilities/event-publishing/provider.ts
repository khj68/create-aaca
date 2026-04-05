import type { EventName } from './types';

/**
 * Publishes a domain event to the transactional outbox.
 *
 * In a real implementation, this writes to the outbox table within the
 * current database transaction. A separate poller or CDC process reads
 * the outbox and forwards events to the message broker (e.g., Kafka).
 *
 * See DECISIONS.yaml ADR-003 for rationale on the outbox pattern.
 *
 * @param eventName - The domain event name (e.g., "order.confirmed")
 * @param payload - The event payload (must be JSON-serializable)
 */
export async function publish(
  eventName: EventName,
  payload: Record<string, unknown>,
): Promise<void> {
  // TODO: Replace with actual outbox insert:
  //
  //   INSERT INTO outbox (id, name, payload, created_at, published)
  //   VALUES (gen_random_uuid(), $1, $2, NOW(), false)
  //
  // This should be called within the same database transaction as the
  // operation's state change (e.g., order insert).

  console.log(`[event-publishing] Publishing event: ${eventName}`, {
    payload_keys: Object.keys(payload),
    timestamp: new Date().toISOString(),
  });
}
