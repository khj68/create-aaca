# Getting Started with AACA

This guide walks you through creating your first AACA project, understanding its structure, and building your first operation.

---

## Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 (or yarn/pnpm)
- A code editor (VS Code recommended)
- An AI agent (Claude Code, Cursor, Copilot, etc.) -- optional but recommended

---

## Installation

Create a new AACA project using the scaffolding CLI:

```bash
npx create-aaca my-service --lang typescript
```

This creates a new directory `my-service/` with the full AACA structure.

### Options

```bash
npx create-aaca my-service --lang typescript   # TypeScript (default)
npx create-aaca my-service --lang python       # Python
npx create-aaca my-service --lang go           # Go

# Additional flags
--no-git          # Skip git initialization
--package-manager # Choose npm, yarn, or pnpm (default: npm)
--template        # Use a specific template (default: basic)
```

### Manual Installation

If you prefer to set up manually, install the AACA validator:

```bash
npm install -D @aaca/validator
```

Then create the project structure by hand (see below).

---

## Project Structure Overview

After scaffolding, your project looks like this:

```
my-service/
  SYSTEM.manifest.yaml          # Root manifest -- entry point for all agents
  CONTEXT.md                    # Project-level context
  package.json

  operations/                   # All business operations
    CONTEXT.md
    create-user/
      CONTEXT.md
      RATIONALE.md
      MODULE.manifest.yaml
      create-user.contract.yaml
      handler.ts
      handler.test.ts

  shared/                       # Shared capabilities
    CONTEXT.md
    email-sender/
      CONTEXT.md
      MODULE.manifest.yaml
      send-email.contract.yaml
      sender.ts
      sender.test.ts

  routes/                       # HTTP entry points
    CONTEXT.md
    routes.manifest.yaml
    auth/
      CONTEXT.md
      MODULE.manifest.yaml
      router.ts

  contracts/                    # Contract registry
    CONTRACTS.manifest.yaml

  infrastructure/               # External adapters (DB, queues, etc.)
    CONTEXT.md
    database/
      CONTEXT.md
      MODULE.manifest.yaml
      connection.ts
```

### Key Files

| File | Purpose |
|---|---|
| `SYSTEM.manifest.yaml` | Root entry point; declares all modules and their locations |
| `MODULE.manifest.yaml` | Per-module declaration of contents and dependencies |
| `CONTEXT.md` | Human-readable explanation of a directory |
| `*.contract.yaml` | Input/output contracts for operations |
| `CONTRACTS.manifest.yaml` | Registry of all contracts in the system |
| `routes.manifest.yaml` | Maps HTTP routes to operations |

---

## Creating Your First Operation

Let's create a `get-user` operation step by step.

### Step 1: Create the directory

```bash
mkdir -p operations/get-user
```

### Step 2: Write the contract

Create `operations/get-user/get-user.contract.yaml`:

```yaml
name: get-user
type: request-response
version: "1.0.0"
description: Retrieves a user by their unique ID

input:
  type: object
  required: [userId]
  properties:
    userId:
      type: string
      format: uuid
      description: The unique identifier of the user

output:
  type: object
  required: [id, email, name, createdAt]
  properties:
    id:
      type: string
      format: uuid
    email:
      type: string
      format: email
    name:
      type: string
    createdAt:
      type: string
      format: date-time

errors:
  - code: USER_NOT_FOUND
    status: 404
    message: No user exists with the given ID

sideEffects: []

invariants:
  - Returns exactly one user or an error; never returns partial data
```

### Step 3: Write the module manifest

Create `operations/get-user/MODULE.manifest.yaml`:

```yaml
name: get-user
type: operation
description: Retrieves a user by their unique ID
contracts:
  - get-user.contract.yaml
implementation: handler.ts
tests:
  - handler.test.ts
dependencies:
  - module: shared/user-store
    contract: user-store.contract.yaml
```

### Step 4: Write the implementation

Create `operations/get-user/handler.ts`:

```typescript
import { GetUserInput, GetUserOutput, GetUserError } from "./get-user.contract";
import { userStore } from "../../shared/user-store/store";

export async function handle(input: GetUserInput): Promise<GetUserOutput> {
  const user = await userStore.findById(input.userId);

  if (!user) {
    throw new GetUserError("USER_NOT_FOUND");
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
  };
}
```

### Step 5: Write the tests

Create `operations/get-user/handler.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { handle } from "./handler";

describe("get-user", () => {
  it("returns a user when found", async () => {
    const result = await handle({ userId: "existing-user-id" });
    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("email");
  });

  it("throws USER_NOT_FOUND when user does not exist", async () => {
    await expect(handle({ userId: "nonexistent-id" }))
      .rejects.toThrow("USER_NOT_FOUND");
  });
});
```

### Step 6: Add context

Create `operations/get-user/CONTEXT.md`:

```markdown
# Get User Operation

## Purpose
Retrieves a single user by their unique ID. Used by the API layer to serve
user profile requests.

## Contents
- `get-user.contract.yaml` - Input/output contract
- `handler.ts` - Implementation
- `handler.test.ts` - Unit tests
- `MODULE.manifest.yaml` - Module declaration

## Agent Guidelines
- To change what fields are returned, update the contract first, then the handler
- This operation is read-only with no side effects
```

### Step 7: Register in the system manifest

Add the new operation to `SYSTEM.manifest.yaml`:

```yaml
modules:
  # ... existing modules
  - name: get-user
    path: operations/get-user
    type: operation
```

And register the contract in `contracts/CONTRACTS.manifest.yaml`:

```yaml
contracts:
  # ... existing contracts
  - name: get-user
    path: operations/get-user/get-user.contract.yaml
    type: request-response
    consumers:
      - routes/api
```

---

## Running Validation

AACA includes a validator that checks your project structure for consistency:

```bash
# Validate the entire project
npx aaca validate

# Validate a specific module
npx aaca validate operations/get-user

# Check for common issues
npx aaca lint
```

The validator checks:
- Every module has a `MODULE.manifest.yaml`
- Every directory has a `CONTEXT.md`
- All contracts referenced in manifests exist
- All dependencies between modules are declared
- Contract schemas are valid JSON Schema
- No orphan files (files not declared in any manifest)

### CI Integration

Add validation to your CI pipeline:

```yaml
# .github/workflows/aaca-validate.yml
name: AACA Validation
on: [push, pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: npm ci
      - run: npx aaca validate
```

---

## AI Agent Discovery Protocol

When an AI agent first encounters an AACA project, it should follow this discovery protocol:

### 1. Read the root manifest

The agent reads `SYSTEM.manifest.yaml` to get a map of the entire project:

```yaml
# SYSTEM.manifest.yaml
name: my-service
version: "1.0.0"
description: User management service
modules:
  - name: create-user
    path: operations/create-user
    type: operation
  - name: get-user
    path: operations/get-user
    type: operation
  - name: email-sender
    path: shared/email-sender
    type: shared
```

### 2. Read the root CONTEXT.md

The agent reads the project-level `CONTEXT.md` for human-readable orientation.

### 3. Navigate to relevant modules

Based on the task (e.g., "fix the user creation bug"), the agent uses the manifest to navigate directly to `operations/create-user/`.

### 4. Read the module manifest and context

Inside the module, the agent reads `MODULE.manifest.yaml` and `CONTEXT.md` to understand the module completely.

### 5. Read the contract

The agent reads the contract to understand inputs, outputs, errors, and side effects.

### 6. Read implementation only when needed

Only after understanding the contract does the agent read the implementation code.

This protocol means the agent reads at most 4-5 small files before fully understanding any part of the system -- regardless of project size.

---

## Next Steps

- Read the [Philosophy](./philosophy.md) to understand the principles behind AACA
- Learn about [Manifests](./manifests.md) for the full manifest specification
- Learn about [Contracts](./contracts.md) for the full contract specification
- See [FAQ](./faq.md) for common questions
