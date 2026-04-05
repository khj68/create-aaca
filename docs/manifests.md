# AACA Manifest Specification

Manifests are the backbone of AACA. They are machine-readable YAML files that declare what exists, where it lives, and how it connects. An AI agent navigating an AACA project reads manifests first and code second.

This document specifies the four manifest types in AACA.

---

## SYSTEM.manifest.yaml

**Location:** Project root (exactly one per project)

**Purpose:** The single entry point for the entire project. An AI agent reads this file first to get a complete map of the system.

### Full Specification

```yaml
# Required fields
name: string                    # Project name (kebab-case)
version: string                 # Semantic version (e.g., "1.0.0")
description: string             # One-line description of the system

# Required: List of all modules in the system
modules:
  - name: string                # Module name (kebab-case) [required]
    path: string                # Relative path from project root [required]
    type: string                # One of: operation, shared, route, infrastructure [required]
    description: string         # One-line description [optional]
    status: string              # One of: active, deprecated, experimental [optional, default: active]

# Optional: Global configuration
config:
  language: string              # Primary language: typescript, python, go [optional]
  framework: string             # Framework in use, if any [optional]
  contractFormat: string        # Contract format: yaml, json [optional, default: yaml]

# Optional: External dependencies
externalDependencies:
  - name: string                # Name of external system [required]
    type: string                # One of: database, queue, api, cache [required]
    description: string         # What this dependency provides [optional]

# Optional: Metadata
metadata:
  team: string                  # Owning team [optional]
  repository: string            # Repository URL [optional]
  documentation: string         # External docs URL [optional]
```

### Example

```yaml
name: user-service
version: "2.1.0"
description: Manages user accounts, authentication, and profiles

modules:
  - name: create-user
    path: operations/create-user
    type: operation
    description: Creates a new user account with email verification

  - name: get-user
    path: operations/get-user
    type: operation
    description: Retrieves a user by ID

  - name: update-user
    path: operations/update-user
    type: operation
    description: Updates user profile information

  - name: delete-user
    path: operations/delete-user
    type: operation
    status: deprecated
    description: Soft-deletes a user account

  - name: email-sender
    path: shared/email-sender
    type: shared
    description: Sends transactional emails

  - name: user-store
    path: shared/user-store
    type: shared
    description: Handles user persistence

  - name: auth-routes
    path: routes/auth
    type: route
    description: Authentication HTTP endpoints

  - name: database
    path: infrastructure/database
    type: infrastructure
    description: PostgreSQL connection management

config:
  language: typescript
  framework: express
  contractFormat: yaml

externalDependencies:
  - name: postgresql
    type: database
    description: Primary data store for user records
  - name: sendgrid
    type: api
    description: Email delivery service

metadata:
  team: platform
  repository: https://github.com/org/user-service
```

---

## MODULE.manifest.yaml

**Location:** Every module directory (one per module)

**Purpose:** Declares the contents, contracts, and dependencies of a single module. An AI agent reads this to fully understand a module without scanning files.

### Full Specification

```yaml
# Required fields
name: string                    # Module name (must match SYSTEM.manifest.yaml) [required]
type: string                    # One of: operation, shared, route, infrastructure [required]
description: string             # One-line description [required]

# Required: What this module implements
contracts:
  - string                      # Relative path to contract file(s) [required, at least one]

# Required: Implementation entry point
implementation: string          # Relative path to main implementation file [required]

# Required: Test files
tests:
  - string                      # Relative path to test file(s) [required, at least one]

# Optional: Dependencies on other modules
dependencies:
  - module: string              # Module path relative to project root [required]
    contract: string            # Which contract this module uses [required]
    type: string                # One of: required, optional [optional, default: required]

# Optional: Modules that consume this module
consumedBy:
  - module: string              # Module path relative to project root [required]
    via: string                 # How it is consumed (contract name or manifest) [optional]

# Optional: Configuration this module requires
config:
  - name: string                # Config key name [required]
    type: string                # Data type [required]
    required: boolean           # Whether this config is required [required]
    description: string         # What this config controls [optional]
    default: any                # Default value [optional]

# Optional: Files in this module not covered above
additionalFiles:
  - path: string                # Relative path [required]
    purpose: string             # What this file is for [required]

# Optional: Metadata
metadata:
  owner: string                 # Team or person responsible [optional]
  status: string                # One of: active, deprecated, experimental [optional]
  tags:
    - string                    # Searchable tags [optional]
```

### Example

```yaml
name: create-user
type: operation
description: Creates a new user account with email verification

contracts:
  - create-user.contract.yaml

implementation: handler.ts

tests:
  - handler.test.ts

dependencies:
  - module: shared/email-sender
    contract: send-email.contract.yaml
    type: required
  - module: shared/user-store
    contract: user-store.contract.yaml
    type: required
  - module: shared/password-hasher
    contract: hash-password.contract.yaml
    type: required

consumedBy:
  - module: routes/auth
    via: routes.manifest.yaml

config:
  - name: EMAIL_VERIFICATION_ENABLED
    type: boolean
    required: false
    description: Whether to send verification emails on signup
    default: true

additionalFiles:
  - path: fixtures/valid-user.json
    purpose: Test fixture for a valid user creation request
  - path: fixtures/duplicate-email.json
    purpose: Test fixture for duplicate email error case

metadata:
  owner: platform-team
  status: active
  tags:
    - user-management
    - onboarding
```

---

## routes.manifest.yaml

**Location:** The `routes/` directory (one per project, or one per route group)

**Purpose:** Maps HTTP entry points to operations. An AI agent reads this to understand the full API surface without scanning router files.

### Full Specification

```yaml
# Required fields
name: string                    # Route group name [required]
basePath: string                # Base URL path prefix [required]
description: string             # What this route group covers [required]

# Required: Route definitions
routes:
  - method: string              # HTTP method: GET, POST, PUT, PATCH, DELETE [required]
    path: string                # URL path (relative to basePath) [required]
    operation: string           # Module name of the target operation [required]
    contract: string            # Path to the operation's contract [required]
    description: string         # What this endpoint does [optional]
    auth: string                # Auth requirement: none, bearer, api-key, session [optional]
    middleware:
      - string                  # Middleware to apply, in order [optional]
    rateLimit:                  # Rate limiting configuration [optional]
      windowMs: number          # Time window in milliseconds [required]
      maxRequests: number       # Max requests per window [required]

# Optional: Shared middleware for all routes in this group
sharedMiddleware:
  - string                      # Middleware applied to every route [optional]

# Optional: CORS configuration
cors:
  origins:
    - string                    # Allowed origins [optional]
  methods:
    - string                    # Allowed methods [optional]
  headers:
    - string                    # Allowed headers [optional]
```

### Example

```yaml
name: auth-routes
basePath: /api/v1/auth
description: Authentication and user management endpoints

sharedMiddleware:
  - request-logging
  - error-handler

cors:
  origins:
    - "https://app.example.com"
  methods:
    - GET
    - POST
    - PUT
    - DELETE

routes:
  - method: POST
    path: /register
    operation: create-user
    contract: operations/create-user/create-user.contract.yaml
    description: Register a new user account
    auth: none
    rateLimit:
      windowMs: 900000
      maxRequests: 10

  - method: GET
    path: /users/:id
    operation: get-user
    contract: operations/get-user/get-user.contract.yaml
    description: Get a user by ID
    auth: bearer

  - method: PUT
    path: /users/:id
    operation: update-user
    contract: operations/update-user/update-user.contract.yaml
    description: Update user profile
    auth: bearer
    middleware:
      - ownership-check

  - method: DELETE
    path: /users/:id
    operation: delete-user
    contract: operations/delete-user/delete-user.contract.yaml
    description: Delete a user account
    auth: bearer
    middleware:
      - ownership-check
      - admin-check
```

---

## CONTRACTS.manifest.yaml

**Location:** The `contracts/` directory (one per project)

**Purpose:** A central registry of all contracts in the system. An AI agent reads this to understand all module boundaries at a glance and to trace dependencies between modules.

### Full Specification

```yaml
# Required fields
name: string                    # Registry name (typically matches project name) [required]
version: string                 # Registry version [required]
description: string             # What this registry covers [required]

# Required: All contracts in the system
contracts:
  - name: string                # Contract name (matches the contract file's name field) [required]
    path: string                # Relative path to the contract file [required]
    type: string                # One of: request-response, event, stream [required]
    version: string             # Contract version [required]
    owner: string               # Module that owns/implements this contract [required]
    consumers:
      - string                  # Modules that consume this contract [optional]
    status: string              # One of: active, deprecated, draft [optional, default: active]
    tags:
      - string                  # Searchable tags [optional]

# Optional: Dependency graph summary
dependencyGraph:
  - from: string                # Source module [required]
    to: string                  # Target module [required]
    contract: string            # Contract that connects them [required]
```

### Example

```yaml
name: user-service-contracts
version: "2.1.0"
description: All contracts for the user management service

contracts:
  - name: create-user
    path: operations/create-user/create-user.contract.yaml
    type: request-response
    version: "1.0.0"
    owner: operations/create-user
    consumers:
      - routes/auth
    status: active
    tags:
      - user-management

  - name: get-user
    path: operations/get-user/get-user.contract.yaml
    type: request-response
    version: "1.0.0"
    owner: operations/get-user
    consumers:
      - routes/auth
      - operations/update-user
    status: active
    tags:
      - user-management

  - name: send-email
    path: shared/email-sender/send-email.contract.yaml
    type: request-response
    version: "1.2.0"
    owner: shared/email-sender
    consumers:
      - operations/create-user
      - operations/reset-password
    status: active
    tags:
      - email
      - notifications

  - name: user-created
    path: events/user-created/user-created.contract.yaml
    type: event
    version: "1.0.0"
    owner: operations/create-user
    consumers:
      - operations/send-welcome-email
      - operations/create-default-settings
    status: active

  - name: user-store
    path: shared/user-store/user-store.contract.yaml
    type: request-response
    version: "2.0.0"
    owner: shared/user-store
    consumers:
      - operations/create-user
      - operations/get-user
      - operations/update-user
      - operations/delete-user
    status: active

dependencyGraph:
  - from: routes/auth
    to: operations/create-user
    contract: create-user
  - from: routes/auth
    to: operations/get-user
    contract: get-user
  - from: operations/create-user
    to: shared/email-sender
    contract: send-email
  - from: operations/create-user
    to: shared/user-store
    contract: user-store
  - from: operations/get-user
    to: shared/user-store
    contract: user-store
```

---

## Validation Rules

The AACA validator enforces the following rules across all manifests:

1. **Existence:** Every module listed in `SYSTEM.manifest.yaml` must have a corresponding directory with a `MODULE.manifest.yaml`
2. **Consistency:** Module names must match between `SYSTEM.manifest.yaml` and `MODULE.manifest.yaml`
3. **Completeness:** Every contract referenced in any manifest must exist as a file
4. **Bidirectional references:** If module A declares a dependency on module B, module B should list module A in `consumedBy`
5. **No orphans:** Every file in the project should be referenced in at least one manifest (warning, not error)
6. **Valid schemas:** Contract files must contain valid JSON Schema in their input/output sections
7. **Route coverage:** Every route in `routes.manifest.yaml` must reference an existing operation and contract

Run validation with:

```bash
npx aaca validate
```
