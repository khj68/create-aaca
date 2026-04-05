# AACA Frequently Asked Questions

---

## Is AACA a replacement for hexagonal/clean architecture?

No. AACA is an **augmentation**, not a replacement. It adds a metadata layer (manifests, contracts, context files) that existing architectures lack. You can apply AACA principles on top of a Clean Architecture or Hexagonal Architecture project.

That said, AACA does recommend a different file organization (operations over layers). If you adopt AACA fully, your directory structure will look more like Vertical Slice Architecture than Clean Architecture. But you can start by adding manifests and context files to your existing structure without reorganizing anything.

The key insight is: Clean Architecture and Hexagonal Architecture optimize for **human developers** who understand conventions and can trace dependency arrows in their heads. AACA optimizes for **AI agents** that need explicit, machine-readable metadata to navigate and modify code confidently.

---

## Can I use AACA with my existing framework (Spring Boot, Express, FastAPI)?

Yes. AACA is framework-agnostic. It defines how files are organized and documented, not how they are executed. Your framework still handles routing, dependency injection, middleware, and other runtime concerns.

**Express example:** Your route files still use `app.get(...)`, but you also declare routes in `routes.manifest.yaml` so agents can discover your API surface without scanning decorators.

**Spring Boot example:** You still use `@RestController` and `@Service` annotations, but you add `MODULE.manifest.yaml` to each module so agents do not need to understand Spring's annotation-based wiring.

**FastAPI example:** You still use `@app.post(...)` decorators, but you add contracts that declare inputs, outputs, and errors in a language-agnostic format.

The framework handles runtime behavior. AACA handles discoverability and documentation.

---

## What languages does AACA support?

AACA is language-agnostic. The manifests and contracts are YAML files that work with any programming language. The `create-aaca` scaffolding CLI currently supports:

- **TypeScript** (primary, most mature)
- **Python**
- **Go**

Community templates exist for Java, C#, and Rust. Since AACA is a set of conventions (manifest files, contract files, context files), you can use it with any language by creating the file structure manually.

---

## Does AACA add overhead?

**Development overhead:** Minimal once you have the habit. Writing a contract takes 2-5 minutes and saves hours of debugging and documentation later. Writing `CONTEXT.md` takes 1-2 minutes per directory. Manifests are updated incrementally as you add modules.

**Runtime overhead:** Zero. AACA is purely a code organization and documentation pattern. Manifest and contract files are not loaded at runtime (unless you choose to use them for runtime validation, which is optional).

**Repository size overhead:** Negligible. YAML files are small. A typical project adds 50-100 KB of manifest and contract files, which is insignificant compared to `node_modules/` or compiled artifacts.

**CI overhead:** The AACA validator adds 2-10 seconds to your CI pipeline, depending on project size. This catches structural issues early and is well worth the time.

---

## How does AACA work with microservices?

Each microservice is an independent AACA project with its own `SYSTEM.manifest.yaml`. Within each service, you use the full AACA structure (operations, contracts, manifests, context files).

For cross-service communication, you have two options:

1. **Shared contract repository:** Maintain a separate repository with contracts for inter-service APIs. Each service references contracts from this shared repository.

2. **Contract-per-service:** Each service publishes its contracts (e.g., as an npm package or a Git submodule), and consuming services reference them.

AACA does not prescribe a service mesh, API gateway, or service discovery mechanism. It focuses on making each service's internal structure navigable by AI agents.

---

## Can I adopt AACA incrementally?

Yes. This is the recommended approach for existing projects. Here is a suggested adoption path:

### Phase 1: Add metadata (no restructuring)

1. Add `SYSTEM.manifest.yaml` to the project root listing your existing modules
2. Add `CONTEXT.md` to key directories
3. Add `MODULE.manifest.yaml` to existing module directories

This phase requires zero code changes. You are adding documentation files only.

### Phase 2: Add contracts

1. Write `.contract.yaml` files for your most important operations
2. Create `CONTRACTS.manifest.yaml` to register them
3. Add `routes.manifest.yaml` for your HTTP endpoints

This phase also requires zero code changes. You are documenting existing interfaces.

### Phase 3: Reorganize (optional)

1. Move from layered organization to operations-based organization
2. Co-locate tests with implementation
3. Add `RATIONALE.md` where needed

This phase involves moving files. Do it one module at a time. Each module can be reorganized independently.

### Phase 4: Validate

1. Add `npx aaca validate` to your CI pipeline
2. Fix any inconsistencies the validator finds
3. Establish the habit of contract-first development for new features

---

## What about shared code between operations?

Shared code goes in the `shared/` directory. Each shared module follows the same AACA structure: it has a `MODULE.manifest.yaml`, a contract, an implementation, tests, and a `CONTEXT.md`.

```
shared/
  email-sender/
    CONTEXT.md
    MODULE.manifest.yaml
    send-email.contract.yaml
    sender.ts
    sender.test.ts
  password-hasher/
    CONTEXT.md
    MODULE.manifest.yaml
    hash-password.contract.yaml
    hasher.ts
    hasher.test.ts
```

The key rule: **shared modules must have contracts**. An operation that uses a shared module declares the dependency in its `MODULE.manifest.yaml`, referencing the shared module's contract. This makes cross-module dependencies explicit and traceable.

Avoid creating a generic `utils/` or `helpers/` directory. If code is shared, it deserves a name, a contract, and a manifest. If it is too small for that, it probably belongs inside the operation that uses it.

---

## How does AACA handle cross-cutting concerns?

Cross-cutting concerns (logging, authentication, error handling, metrics, caching) are handled through a combination of:

### 1. Infrastructure modules

For concerns that require external systems (database connections, message queues, cache clients):

```
infrastructure/
  database/
    CONTEXT.md
    MODULE.manifest.yaml
    database.contract.yaml
    connection.ts
  cache/
    CONTEXT.md
    MODULE.manifest.yaml
    cache.contract.yaml
    client.ts
```

### 2. Middleware declared in route manifests

For HTTP-level concerns (authentication, rate limiting, request logging):

```yaml
# routes.manifest.yaml
routes:
  - method: POST
    path: /users
    operation: create-user
    middleware:
      - auth-bearer
      - rate-limit
      - request-logging
```

The middleware is declared in the route manifest so agents know which concerns apply to which endpoints.

### 3. Side effects in contracts

For concerns that are part of an operation's behavior (audit logging, metrics):

```yaml
# create-user.contract.yaml
sideEffects:
  - Logs the signup event to the audit trail
  - Increments the user.signup counter metric
```

This makes side effects visible to agents without reading implementation code.

### 4. Shared modules for reusable logic

For concerns used across multiple operations (validation rules, formatting):

```
shared/
  audit-logger/
    MODULE.manifest.yaml
    audit-logger.contract.yaml
    logger.ts
```

The principle is the same as everywhere else in AACA: **make it explicit**. If a concern affects an operation, declare it in the contract's side effects. If it is a dependency, declare it in the module manifest. Never rely on implicit framework behavior that an agent cannot discover by reading manifests.
