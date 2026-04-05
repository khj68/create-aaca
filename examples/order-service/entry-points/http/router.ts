/**
 * HTTP router for the order service.
 *
 * Maps HTTP requests to operation handlers. This is a thin adapter layer
 * that handles HTTP-specific concerns (request parsing, response formatting,
 * error-to-status-code mapping) and delegates business logic to operations.
 *
 * Uses Express-style routing.
 */

import type { Request, Response, NextFunction } from 'express';
import { handleCreateOrder } from '../../operations/create-order/handler';
import { handleGetOrder } from '../../operations/get-order/handler';
import { checkHealth } from '../../infrastructure/postgres/health';

// ---------------------------------------------------------------------------
// Error-to-HTTP mapping
// ---------------------------------------------------------------------------

interface OperationError extends Error {
  code: string;
  httpStatus: number;
  items?: unknown;
}

function isOperationError(error: unknown): error is OperationError {
  return (
    error instanceof Error &&
    'code' in error &&
    'httpStatus' in error
  );
}

function handleError(error: unknown, res: Response): void {
  if (isOperationError(error)) {
    const body: Record<string, unknown> = {
      error: {
        code: error.code,
        message: error.message,
      },
    };

    // Include additional payload for specific errors (e.g., insufficient inventory items)
    if ('items' in error) {
      (body.error as Record<string, unknown>).items = error.items;
    }

    res.status(error.httpStatus).json(body);
    return;
  }

  // Unexpected error -- log and return 500
  console.error('[http] Unexpected error:', error);
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  });
}

// ---------------------------------------------------------------------------
// Route handlers
// ---------------------------------------------------------------------------

/**
 * POST /orders
 *
 * Creates a new order from a shopping cart.
 */
export async function createOrderRoute(
  req: Request,
  res: Response,
  _next: NextFunction,
): Promise<void> {
  try {
    const input = {
      cart_id: req.body.cart_id,
      customer_id: req.body.customer_id,
      payment_method_id: req.body.payment_method_id,
      discount_code: req.body.discount_code,
    };

    const result = await handleCreateOrder(input);
    res.status(201).json(result);
  } catch (error) {
    handleError(error, res);
  }
}

/**
 * GET /orders/:id
 *
 * Retrieves an existing order by ID.
 */
export async function getOrderRoute(
  req: Request,
  res: Response,
  _next: NextFunction,
): Promise<void> {
  try {
    const result = await handleGetOrder({ order_id: req.params.id });
    res.status(200).json(result);
  } catch (error) {
    handleError(error, res);
  }
}

/**
 * GET /health
 *
 * Database health check for readiness probes.
 */
export async function healthRoute(
  _req: Request,
  res: Response,
  _next: NextFunction,
): Promise<void> {
  const health = await checkHealth();
  const status = health.status === 'healthy' ? 200 : 503;
  res.status(status).json(health);
}

// ---------------------------------------------------------------------------
// Router setup (Express)
// ---------------------------------------------------------------------------

/**
 * Registers all routes on an Express app or router.
 *
 * Usage:
 *   import express from 'express';
 *   import { registerRoutes } from './entry-points/http/router';
 *   const app = express();
 *   app.use(express.json());
 *   registerRoutes(app);
 *   app.listen(3000);
 */
export function registerRoutes(app: {
  post: (path: string, handler: (req: Request, res: Response, next: NextFunction) => void) => void;
  get: (path: string, handler: (req: Request, res: Response, next: NextFunction) => void) => void;
}): void {
  app.post('/orders', createOrderRoute);
  app.get('/orders/:id', getOrderRoute);
  app.get('/health', healthRoute);
}
