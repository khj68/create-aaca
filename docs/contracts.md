# AACA Contract Specification

Contracts are the interface definitions of AACA. Every interaction between modules -- whether a synchronous call, an asynchronous event, or a data stream -- is defined by a contract file before any implementation is written.

Contracts serve as the single source of truth for what a module accepts, what it returns, what can go wrong, and what side effects it produces.

---

## Contract File Format

Contract files are YAML files with the extension `.contract.yaml`. They live inside the module directory that implements them.

### Location Convention

```
operations/create-user/
  create-user.contract.yaml     # Contract lives next to its implementation
  handler.ts
```

---

## Contract Types

AACA supports three contract types, each modeling a different interaction pattern.

### 1. request-response

A synchronous call-and-return interaction. The caller sends input and receives output (or an error).

```yaml
type: request-response
```

Use for: API endpoints, service calls, database queries, any call that returns a result.

### 2. event

An asynchronous notification. The producer emits an event; zero or more consumers process it independently.

```yaml
type: event
```

Use for: Domain events, notifications, audit logs, triggering background work.

### 3. stream

A continuous flow of data. The producer emits multiple items over time; the consumer processes them as they arrive.

```yaml
type: stream
```

Use for: Real-time feeds, file uploads/downloads, WebSocket connections, server-sent events.

---

## Full Contract Schema

```yaml
# === Identity ===
name: string                      # Contract name (kebab-case) [required]
type: string                      # One of: request-response, event, stream [required]
version: string                   # Semantic version [required]
description: string               # One-line description [required]

# === Input Schema ===
# JSON Schema-compatible definition of what this contract accepts
input:                            # [required]
  type: string                    # JSON Schema type (usually "object") [required]
  required:                       # List of required property names [optional]
    - string
  properties:                     # Property definitions [required]
    propertyName:
      type: string                # JSON Schema type [required]
      format: string              # Format hint (email, uuid, date-time, uri, etc.) [optional]
      description: string         # What this property represents [optional]
      minLength: number           # String minimum length [optional]
      maxLength: number           # String maximum length [optional]
      minimum: number             # Number minimum [optional]
      maximum: number             # Number maximum [optional]
      pattern: string             # Regex pattern [optional]
      enum:                       # Allowed values [optional]
        - any
      items:                      # Array item schema (when type is "array") [optional]
        type: string
      default: any                # Default value [optional]

# === Output Schema ===
# JSON Schema-compatible definition of what this contract returns
output:                           # [required for request-response and stream, omit for event]
  type: string                    # JSON Schema type [required]
  required:
    - string
  properties:
    propertyName:
      type: string
      format: string
      description: string
      # ... same options as input properties

# === Event Payload (for event type only) ===
payload:                          # [required for event type, omit for others]
  type: string
  required:
    - string
  properties:
    propertyName:
      type: string
      description: string

# === Error Definitions ===
# Exhaustive list of all errors this contract can produce
errors:                           # [required, at least one entry]
  - code: string                  # Error code (UPPER_SNAKE_CASE) [required]
    status: number                # HTTP status code [required]
    message: string               # Human-readable error description [required]
    description: string           # When/why this error occurs [optional]
    data:                         # Additional error data schema [optional]
      type: string
      properties:
        propertyName:
          type: string

# === Side Effects ===
# Exhaustive list of observable effects beyond the return value
sideEffects:                      # [required, use empty array [] if none]
  - string                        # Description of each side effect

# === Invariants ===
# Conditions that are always true when this contract is fulfilled
invariants:                       # [optional]
  - string                        # Description of each invariant

# === Examples ===
# Concrete examples of input/output pairs
examples:                         # [optional but strongly recommended]
  - name: string                  # Example name [required]
    description: string           # What this example demonstrates [optional]
    input:                        # Example input values [required]
      propertyName: value
    output:                       # Expected output values [required for request-response]
      propertyName: value
    error: string                 # Expected error code, if this is an error case [optional]

# === Metadata ===
metadata:                         # [optional]
  owner: string                   # Team or person responsible
  createdAt: string               # ISO date of contract creation
  updatedAt: string               # ISO date of last update
  deprecatedAt: string            # ISO date if deprecated
  replacedBy: string              # Successor contract name, if deprecated
  tags:
    - string
```

---

## Field Details

### Input and Output Schemas

Input and output schemas use [JSON Schema](https://json-schema.org/) syntax. This means they can be validated using any JSON Schema validator and can be used to auto-generate TypeScript types, Python dataclasses, Go structs, etc.

**Supported JSON Schema types:**
- `string` -- with optional `format`: `email`, `uuid`, `date-time`, `uri`, `hostname`, `ipv4`, `ipv6`
- `number` / `integer` -- with optional `minimum`, `maximum`, `exclusiveMinimum`, `exclusiveMaximum`
- `boolean`
- `array` -- with `items` defining element schema
- `object` -- with `properties` and `required`
- `null`

**Nested objects** are supported:

```yaml
properties:
  address:
    type: object
    required: [street, city]
    properties:
      street:
        type: string
      city:
        type: string
      zipCode:
        type: string
        pattern: "^[0-9]{5}$"
```

### Error Definitions

Errors must be **exhaustive**. Every error that the implementation can produce must be listed in the contract. This allows AI agents to handle all error cases when consuming a contract.

**HTTP status code guidelines:**

| Status | Use For |
|---|---|
| 400 | Invalid input, validation failure |
| 401 | Missing or invalid authentication |
| 403 | Authenticated but not authorized |
| 404 | Resource not found |
| 409 | Conflict (duplicate, already exists) |
| 422 | Semantically invalid (valid format but wrong meaning) |
| 429 | Rate limited |
| 500 | Internal/unexpected error |

### Side Effects

Side effects declare every observable change beyond the return value. This is critical for AI agents to understand the full impact of calling an operation.

Examples of side effects:
- `Inserts a row into the users table`
- `Sends an email to the provided address`
- `Publishes a user-created event to the message queue`
- `Increments the signup counter metric`
- `Writes to the audit log`

Use an empty array `[]` for pure/read-only operations.

### Invariants

Invariants are conditions that are **always true** when the contract is fulfilled correctly. They help AI agents understand guarantees they can rely on.

Examples:
- `Email addresses are unique across all users`
- `Passwords are never returned in the output`
- `The createdAt timestamp is always in UTC`
- `Deleted users are soft-deleted; the record is never removed from the database`

---

## Complete Example: request-response

```yaml
name: create-user
type: request-response
version: "1.0.0"
description: Creates a new user account with email verification

input:
  type: object
  required: [email, password, name]
  properties:
    email:
      type: string
      format: email
      description: The user's email address, used for login and communication
    password:
      type: string
      minLength: 8
      maxLength: 128
      description: The user's password (will be hashed before storage)
    name:
      type: string
      minLength: 1
      maxLength: 100
      description: The user's display name
    locale:
      type: string
      pattern: "^[a-z]{2}-[A-Z]{2}$"
      description: The user's preferred locale
      default: "en-US"

output:
  type: object
  required: [id, email, name, createdAt, emailVerified]
  properties:
    id:
      type: string
      format: uuid
      description: Unique identifier for the created user
    email:
      type: string
      format: email
    name:
      type: string
    createdAt:
      type: string
      format: date-time
      description: UTC timestamp of account creation
    emailVerified:
      type: boolean
      description: Whether the email has been verified (always false on creation)

errors:
  - code: EMAIL_ALREADY_EXISTS
    status: 409
    message: A user with this email already exists
    description: Returned when the email is already registered in the system
  - code: INVALID_PASSWORD
    status: 400
    message: Password does not meet requirements
    description: Returned when the password is too short, too common, or breached
    data:
      type: object
      properties:
        reason:
          type: string
          enum: [too_short, too_common, breached]
  - code: INVALID_EMAIL_DOMAIN
    status: 422
    message: Email domain is not allowed
    description: Returned when the email domain is blocklisted

sideEffects:
  - Inserts a new row into the users table
  - Sends a verification email to the provided email address
  - Publishes a user-created event to the event bus
  - Logs the signup event to the audit trail

invariants:
  - Email addresses are unique across all users
  - Passwords are hashed with bcrypt before storage; plaintext is never persisted
  - The emailVerified field is always false upon creation
  - The id field is a v4 UUID generated server-side

examples:
  - name: successful-creation
    description: Standard user creation with all required fields
    input:
      email: "alice@example.com"
      password: "securePassword123"
      name: "Alice Smith"
    output:
      id: "550e8400-e29b-41d4-a716-446655440000"
      email: "alice@example.com"
      name: "Alice Smith"
      createdAt: "2024-01-15T10:30:00Z"
      emailVerified: false

  - name: with-locale
    description: User creation with optional locale
    input:
      email: "bob@example.com"
      password: "anotherSecure456"
      name: "Bob Jones"
      locale: "fr-FR"
    output:
      id: "660e8400-e29b-41d4-a716-446655440001"
      email: "bob@example.com"
      name: "Bob Jones"
      createdAt: "2024-01-15T10:31:00Z"
      emailVerified: false

  - name: duplicate-email
    description: Attempt to create a user with an existing email
    input:
      email: "alice@example.com"
      password: "securePassword123"
      name: "Alice Duplicate"
    error: EMAIL_ALREADY_EXISTS

metadata:
  owner: platform-team
  createdAt: "2024-01-01"
  updatedAt: "2024-06-15"
  tags:
    - user-management
    - onboarding
    - authentication
```

---

## Complete Example: event

```yaml
name: user-created
type: event
version: "1.0.0"
description: Emitted when a new user account is successfully created

payload:
  type: object
  required: [userId, email, name, createdAt]
  properties:
    userId:
      type: string
      format: uuid
      description: The unique ID of the newly created user
    email:
      type: string
      format: email
      description: The user's email address
    name:
      type: string
      description: The user's display name
    createdAt:
      type: string
      format: date-time
      description: When the user was created (UTC)
    locale:
      type: string
      description: The user's preferred locale

errors: []

sideEffects:
  - Published to the user-events topic in the message broker

invariants:
  - This event is emitted exactly once per successful user creation
  - The event is emitted after the database transaction commits
  - The userId in the event always corresponds to an existing user record

examples:
  - name: standard-event
    description: Typical user-created event
    input:
      userId: "550e8400-e29b-41d4-a716-446655440000"
      email: "alice@example.com"
      name: "Alice Smith"
      createdAt: "2024-01-15T10:30:00Z"
      locale: "en-US"

metadata:
  owner: platform-team
  createdAt: "2024-01-01"
  tags:
    - user-management
    - domain-events
```

---

## Complete Example: stream

```yaml
name: activity-feed
type: stream
version: "1.0.0"
description: Real-time stream of user activity events

input:
  type: object
  required: [userId]
  properties:
    userId:
      type: string
      format: uuid
      description: The user whose activity to stream
    since:
      type: string
      format: date-time
      description: Only stream events after this timestamp
      default: now

output:
  type: object
  required: [eventId, type, timestamp]
  properties:
    eventId:
      type: string
      format: uuid
    type:
      type: string
      enum: [login, logout, profile-update, password-change]
    timestamp:
      type: string
      format: date-time
    details:
      type: object
      description: Event-specific details (varies by type)

errors:
  - code: USER_NOT_FOUND
    status: 404
    message: No user exists with the given ID
  - code: STREAM_TIMEOUT
    status: 408
    message: Stream timed out after inactivity period

sideEffects: []

invariants:
  - Events are delivered in chronological order
  - Each event is delivered at least once (at-least-once semantics)
  - The stream automatically closes after 30 minutes of inactivity

examples:
  - name: login-event
    description: A login event in the stream
    input:
      userId: "550e8400-e29b-41d4-a716-446655440000"
    output:
      eventId: "770e8400-e29b-41d4-a716-446655440002"
      type: "login"
      timestamp: "2024-01-15T10:30:00Z"
      details:
        ipAddress: "192.168.1.1"
        userAgent: "Mozilla/5.0"

metadata:
  owner: platform-team
  tags:
    - real-time
    - activity
```

---

## Contract Versioning

Contracts use semantic versioning:

- **Patch** (1.0.0 -> 1.0.1): Documentation changes, adding optional fields with defaults
- **Minor** (1.0.0 -> 1.1.0): Adding new optional input/output fields, adding new error codes
- **Major** (1.0.0 -> 2.0.0): Removing fields, changing required fields, changing types, removing error codes

When introducing a breaking change:
1. Create the new contract version
2. Mark the old version as `deprecated` with `replacedBy` pointing to the new version
3. Update all consumers before removing the old version

---

## Contract Validation

The AACA validator checks contracts for:

1. **Schema validity**: Input and output must be valid JSON Schema
2. **Error exhaustiveness**: Implementation must not throw errors not listed in the contract
3. **Side effect accuracy**: Declared side effects must match implementation behavior
4. **Example consistency**: Example inputs must validate against the input schema; example outputs must validate against the output schema
5. **Version consistency**: Contract version must match what is declared in `CONTRACTS.manifest.yaml`

```bash
# Validate all contracts
npx aaca validate --contracts

# Validate a specific contract
npx aaca validate operations/create-user/create-user.contract.yaml
```
