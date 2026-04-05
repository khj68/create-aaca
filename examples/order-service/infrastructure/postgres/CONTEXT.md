# PostgreSQL Infrastructure

## What It Does

Provides database connection management and health checks for the PostgreSQL
database used by this service. All persistence modules in operations use this
infrastructure for actual database access.

## When to Modify

- Changing connection pool settings
- Adding SSL or authentication configuration
- Modifying health check logic
- Adding migration support

## When NOT to Modify

- Adding business-specific queries (those belong in operation persistence files)
- Changing what data is stored (that is an operation concern)

## Configuration

Connection settings are read from environment variables:
- `DATABASE_URL` -- Full PostgreSQL connection string
- `DB_POOL_MIN` -- Minimum pool size (default: 2)
- `DB_POOL_MAX` -- Maximum pool size (default: 10)
