# AACA Philosophy: The 7 Principles

AACA (AI-Agent Centric Architecture) is built on seven principles that make codebases fully navigable, predictable, and modifiable by AI agents. Each principle addresses a specific failure mode that AI agents encounter when working with conventional architectures.

---

## 1. Manifest Over Convention

### What It Is

Never rely on naming conventions, directory placement, or implicit assumptions to convey architectural meaning. Instead, declare everything in machine-readable manifest files that serve as the single source of truth for what exists, where it lives, and how it connects.

### Why It Matters for AI Agents

Conventions are ambiguous. When an AI agent encounters a directory called `services/`, it cannot know whether it contains business logic, infrastructure adapters, or both. Naming conventions like `UserService` vs `UserRepository` require the agent to understand project-specific naming rules that vary across teams and frameworks. Manifests eliminate guesswork entirely -- the agent reads a structured file and knows exactly what it is dealing with.

### How to Apply It

- Place a `SYSTEM.manifest.yaml` at the project root declaring all top-level modules
- Place a `MODULE.manifest.yaml` in every module directory declaring its operations, contracts, and dependencies
- Use `routes.manifest.yaml` to declare HTTP entry points instead of relying on decorator/annotation scanning
- Never assume an agent can infer purpose from a filename or directory name alone

### Example

Instead of relying on the convention that `src/services/UserService.ts` is a service:

```yaml
# operations/create-user/MODULE.manifest.yaml
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
```

The agent reads this file and knows exactly what `create-user` does, what contracts it fulfills, and what it depends on -- no scanning, no guessing.

---

## 2. Context At Every Level

### What It Is

Every directory in the project contains a `CONTEXT.md` file that explains in natural language: why this directory exists, what it contains, how agents should interact with it, and what decisions led to its current form.

### Why It Matters for AI Agents

AI agents navigate codebases by reading files. Without context files, an agent must read and analyze every file in a directory to understand its purpose. `CONTEXT.md` gives the agent an immediate briefing -- a human-readable map that accelerates comprehension from minutes to seconds.

### How to Apply It

- Add `CONTEXT.md` to every directory, including the project root
- Write it for an audience that has never seen the project before
- Include: purpose, contents summary, interaction guidelines, known constraints
- Update it when the directory's purpose or contents change significantly

### Example

```markdown
<!-- operations/create-user/CONTEXT.md -->
# Create User Operation

## Purpose
Handles the creation of new user accounts. This is the primary entry point
for user registration in the system.

## What This Contains
- `create-user.contract.yaml` - The input/output contract for this operation
- `handler.ts` - The implementation
- `handler.test.ts` - Unit tests
- `MODULE.manifest.yaml` - Machine-readable module declaration

## Agent Guidelines
- To modify user creation logic, edit `handler.ts`
- To change the API shape, update `create-user.contract.yaml` first, then adapt the handler
- This operation depends on the email-sender shared module; changes to email sending may affect this operation

## Constraints
- Email addresses must be unique (enforced at the database level)
- Passwords are hashed before storage; never store plaintext
```

---

## 3. Operations Over Layers

### What It Is

Organize code by what the system **does** (operations and capabilities), not by technical role (controllers, services, repositories). Each operation is a vertical slice that contains everything related to a single system capability.

### Why It Matters for AI Agents

When an agent is asked to "fix the user creation bug," it needs to find all code related to user creation. In a layered architecture, that code is scattered across `controllers/UserController`, `services/UserService`, `repositories/UserRepository`, `models/User`, and `dtos/CreateUserDto` -- five files in five directories. In AACA, all related code lives in `operations/create-user/`. The agent has one place to look.

### How to Apply It

- Create an `operations/` directory at the module root
- Each operation gets its own directory containing contracts, implementation, and tests
- Shared capabilities (used by multiple operations) go in a `shared/` directory
- Never create directories named after technical layers (`controllers/`, `services/`, `repositories/`)

### Example

**Layered (scattered across directories):**
```
src/
  controllers/UserController.ts    # route handling
  services/UserService.ts          # business logic
  repositories/UserRepository.ts   # data access
  dtos/CreateUserDto.ts            # data shapes
  models/User.ts                   # entity
```

**AACA (grouped by operation):**
```
operations/
  create-user/
    create-user.contract.yaml      # what this operation accepts/returns
    handler.ts                     # all logic for this operation
    handler.test.ts                # tests
    MODULE.manifest.yaml           # manifest
    CONTEXT.md                     # context
```

---

## 4. Contracts Before Code

### What It Is

Every interaction between modules -- whether a function call, HTTP request, event, or message -- is defined by a schema/contract file **before** any implementation is written. Contracts are YAML files containing input schemas, output schemas, error definitions, side effects, and invariants.

### Why It Matters for AI Agents

Contracts give agents a complete understanding of module boundaries without reading implementation code. An agent can read a contract and know: what data goes in, what data comes out, what errors can occur, and what side effects to expect. This makes it possible for agents to modify, replace, or integrate modules with confidence.

### How to Apply It

- Write a `.contract.yaml` file for every operation before writing implementation
- Include input schema, output schema, error definitions, side effects, and invariants
- Use JSON Schema-compatible types for inputs and outputs
- Register all contracts in `CONTRACTS.manifest.yaml`
- Validate contracts automatically in CI

### Example

```yaml
# operations/create-user/create-user.contract.yaml
name: create-user
type: request-response
version: "1.0.0"
description: Creates a new user account

input:
  type: object
  required: [email, password, name]
  properties:
    email:
      type: string
      format: email
    password:
      type: string
      minLength: 8
    name:
      type: string
      minLength: 1

output:
  type: object
  required: [id, email, name, createdAt]
  properties:
    id:
      type: string
      format: uuid
    email:
      type: string
    name:
      type: string
    createdAt:
      type: string
      format: date-time

errors:
  - code: EMAIL_ALREADY_EXISTS
    status: 409
    message: A user with this email already exists
  - code: INVALID_PASSWORD
    status: 400
    message: Password does not meet requirements

sideEffects:
  - Sends verification email to the provided address
  - Creates a record in the users database table

invariants:
  - Email addresses are unique across all users
  - Passwords are never stored in plaintext
```

---

## 5. Self-Contained Modules

### What It Is

A module contains **everything** needed to understand it: contracts, implementation, tests, context, and rationale. An agent should never need to leave the module directory to understand what the module does or how it works.

### Why It Matters for AI Agents

When an agent modifies code, it needs full context. If tests are in a separate `test/` tree, contracts are in a `schemas/` directory, and documentation is in a `docs/` folder, the agent must jump across the entire project to gather context. Self-contained modules mean the agent reads one directory and has everything.

### How to Apply It

- Keep contracts, implementation, tests, and context in the same directory
- If a module needs shared types, import them via explicit contract references
- Never separate test files from the code they test
- Include `RATIONALE.md` for non-obvious design decisions

### Example

```
operations/create-user/
  CONTEXT.md                     # why this exists, how to work with it
  RATIONALE.md                   # why we chose this approach
  MODULE.manifest.yaml           # machine-readable declaration
  create-user.contract.yaml      # input/output contract
  handler.ts                     # implementation
  handler.test.ts                # tests (right next to the code)
  fixtures/                      # test fixtures, if needed
    valid-user.json
    duplicate-email.json
```

An agent working on this module never needs to look elsewhere.

---

## 6. Explicit Change Boundaries

### What It Is

The architecture explicitly declares which files must change for any given type of requirement. Change impact is encoded in the manifests and contracts, not left to human intuition or agent inference.

### Why It Matters for AI Agents

When an agent is asked to "add a phone number field to user creation," it needs to know every file that must change. In conventional architectures, the agent must trace through code to find all affected files -- and it often misses some. With explicit change boundaries, the manifest declares dependencies, and the agent can compute the full change set before writing any code.

### How to Apply It

- Declare dependencies between modules in `MODULE.manifest.yaml`
- Use `CONTRACTS.manifest.yaml` to track which modules consume which contracts
- When a contract changes, the manifest tells the agent exactly which modules are affected
- Consider adding a `change-map` section to manifests for common change scenarios

### Example

```yaml
# MODULE.manifest.yaml
name: create-user
dependencies:
  - module: shared/email-sender
    contract: send-email.contract.yaml
  - module: shared/user-store
    contract: user-store.contract.yaml

consumedBy:
  - module: routes/auth
    via: routes.manifest.yaml
```

When the agent changes the `create-user` contract, it knows to check:
1. `routes/auth` (which consumes this operation)
2. Any module listed in `consumedBy`

When the agent changes the `email-sender` contract, it knows `create-user` is affected.

---

## 7. Rationale As Code

### What It Is

Design decisions, trade-offs, and architectural choices are encoded in structured files (`RATIONALE.md`) within the codebase, right next to the code they explain. These are not external wiki pages or Confluence docs -- they live in version control and evolve with the code.

### Why It Matters for AI Agents

AI agents make better decisions when they understand **why** code is written the way it is. Without rationale, an agent might "improve" code by undoing a deliberate trade-off. Rationale files prevent agents from breaking intentional design decisions by giving them the reasoning behind the current implementation.

### How to Apply It

- Add `RATIONALE.md` to any module where the design is non-obvious
- Document: what alternatives were considered, why this approach was chosen, what trade-offs were accepted
- Update rationale when the design changes
- Use a structured format that agents can parse reliably

### Example

```markdown
<!-- operations/create-user/RATIONALE.md -->
# Rationale: Create User Operation

## Decision: Synchronous email verification

### Context
We considered two approaches for email verification:
1. Send verification email synchronously during user creation
2. Emit an event and let a background worker send the email

### Choice
We chose option 1 (synchronous) because:
- Simpler error handling: if email sending fails, user creation fails
- Users expect immediate verification emails
- Current throughput (< 100 signups/hour) does not require async processing

### Trade-offs
- User creation is slower (adds ~200ms for email sending)
- If the email service is down, user creation fails entirely

### Revisit When
- Signup volume exceeds 1000/hour
- Email service SLA becomes a concern
```

---

## Summary

| Principle | Core Idea | Agent Benefit |
|---|---|---|
| Manifest Over Convention | Declare, don't imply | Zero-ambiguity discovery |
| Context At Every Level | Explain every directory | Instant comprehension |
| Operations Over Layers | Organize by capability | Single-location changes |
| Contracts Before Code | Define interfaces first | Safe modification |
| Self-Contained Modules | Everything in one place | No cross-project jumping |
| Explicit Change Boundaries | Declare impact zones | Complete change sets |
| Rationale As Code | Encode decisions | Informed modifications |

These principles work together to create codebases where AI agents can operate with the same confidence and context that the original authors had when writing the code.
