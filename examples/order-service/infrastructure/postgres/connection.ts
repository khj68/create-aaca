/**
 * PostgreSQL connection pool and query helper.
 *
 * Provides a shared connection pool for all database operations in the service.
 * Configuration is read from environment variables.
 *
 * In a real implementation, this would use the `pg` package (node-postgres).
 */

export interface QueryResult<T = Record<string, unknown>> {
  rows: T[];
  rowCount: number;
}

export interface DatabasePool {
  query<T = Record<string, unknown>>(
    text: string,
    params?: unknown[],
  ): Promise<QueryResult<T>>;
  end(): Promise<void>;
}

// ---------------------------------------------------------------------------
// Connection pool singleton
// ---------------------------------------------------------------------------

let pool: DatabasePool | null = null;

/**
 * Returns the shared database connection pool, creating it if necessary.
 *
 * Configuration is read from environment variables:
 * - DATABASE_URL: Full PostgreSQL connection string
 * - DB_POOL_MIN: Minimum pool size (default: 2)
 * - DB_POOL_MAX: Maximum pool size (default: 10)
 */
export function getPool(): DatabasePool {
  if (pool) return pool;

  // TODO: Replace with actual pg.Pool initialization:
  //
  //   import { Pool } from 'pg';
  //   pool = new Pool({
  //     connectionString: process.env.DATABASE_URL,
  //     min: parseInt(process.env.DB_POOL_MIN ?? '2', 10),
  //     max: parseInt(process.env.DB_POOL_MAX ?? '10', 10),
  //   });

  pool = {
    async query<T>(_text: string, _params?: unknown[]): Promise<QueryResult<T>> {
      console.log('[postgres] query stub called');
      return { rows: [] as T[], rowCount: 0 };
    },
    async end(): Promise<void> {
      console.log('[postgres] pool closed');
      pool = null;
    },
  };

  return pool;
}

/**
 * Closes the database connection pool. Call this on graceful shutdown.
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

/**
 * Convenience function to execute a query using the shared pool.
 */
export async function query<T = Record<string, unknown>>(
  text: string,
  params?: unknown[],
): Promise<QueryResult<T>> {
  return getPool().query<T>(text, params);
}
