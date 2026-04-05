import { getPool } from './connection';

export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  latency_ms: number;
  details?: string;
}

/**
 * Checks the health of the PostgreSQL database connection.
 *
 * Executes a simple `SELECT 1` query and measures the round-trip latency.
 * Used by HTTP readiness probes (e.g., GET /health) to determine if the
 * service can accept traffic.
 *
 * @returns A health status object with connection state and latency.
 */
export async function checkHealth(): Promise<HealthStatus> {
  const start = Date.now();

  try {
    await getPool().query('SELECT 1');
    const latency_ms = Date.now() - start;

    return {
      status: 'healthy',
      latency_ms,
    };
  } catch (error) {
    const latency_ms = Date.now() - start;
    const message = error instanceof Error ? error.message : 'Unknown error';

    return {
      status: 'unhealthy',
      latency_ms,
      details: `Database connection failed: ${message}`,
    };
  }
}
