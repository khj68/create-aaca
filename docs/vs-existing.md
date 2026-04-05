# AACA vs Existing Architectures

This document compares AACA to established architectural patterns across four dimensions:

1. **File organization** -- How code is physically structured
2. **AI agent discovery** -- How an agent finds relevant code for a task
3. **Change impact analysis** -- How you determine what must change for a requirement
4. **Pros and cons** -- Strengths and weaknesses of each approach

---

## Clean Architecture (Uncle Bob)

### File Organization

```
src/
  domain/
    entities/
      User.ts
      Order.ts
    useCases/
      CreateUser.ts
      GetUser.ts
  application/
    services/
      UserService.ts
    interfaces/
      IUserRepository.ts
  infrastructure/
    repositories/
      UserRepository.ts
    database/
      connection.ts
  presentation/
    controllers/
      UserController.ts
    dtos/
      CreateUserDto.ts
```

Code is organized in concentric rings: entities at the center, use cases around them, then adapters, then frameworks. The dependency rule states that inner rings must not know about outer rings.

### AI Agent Discovery

An agent tasked with "fix the user creation bug" must:
1. Guess that user creation might be in `useCases/CreateUser.ts`
2. Find the interface in `application/interfaces/IUserRepository.ts`
3. Find the implementation in `infrastructure/repositories/UserRepository.ts`
4. Check the controller in `presentation/controllers/UserController.ts`
5. Check the DTO in `presentation/dtos/CreateUserDto.ts`

That is 5 files across 5 different directories. The agent must understand the convention that use cases live in `domain/useCases/` and that infrastructure implements domain interfaces.

### Change Impact Analysis

No built-in mechanism. The agent must trace dependency arrows through interfaces and implementations manually. Changing a use case signature requires checking all controllers that call it, and changing an entity requires checking all use cases that reference it. This is done by reading code and following imports.

### Pros

- Strong separation of concerns
- Domain logic is isolated and testable
- Framework-independent core
- Well-documented pattern with extensive community knowledge

### Cons

- High ceremony: many files for simple operations
- Scattered code: one feature spans many directories
- Relies on naming conventions for discovery
- No machine-readable metadata about module relationships
- AI agents must understand the dependency rule to navigate correctly

---

## Hexagonal Architecture (Ports & Adapters)

### File Organization

```
src/
  core/
    domain/
      User.ts
    ports/
      inbound/
        CreateUserPort.ts
      outbound/
        UserRepositoryPort.ts
        EmailSenderPort.ts
    services/
      UserService.ts
  adapters/
    inbound/
      rest/
        UserController.ts
      graphql/
        UserResolver.ts
    outbound/
      persistence/
        PostgresUserRepository.ts
      email/
        SendGridEmailSender.ts
  config/
    DependencyInjection.ts
```

Code is organized around a hexagonal core with ports (interfaces) defining how the outside world interacts with the application, and adapters implementing those ports.

### AI Agent Discovery

An agent must:
1. Identify the relevant port in `ports/inbound/` or `ports/outbound/`
2. Find the service that uses the port in `core/services/`
3. Find the adapter that implements the port in `adapters/`
4. Understand the DI configuration to know which adapter is wired to which port

The agent must understand the inbound/outbound distinction and know that ports are interfaces while adapters are implementations.

### Change Impact Analysis

Ports provide some boundary information -- changing a port tells you which adapters must change. But there is no centralized registry of port-to-adapter mappings. The agent must read DI configuration or scan for implementations.

### Pros

- Excellent testability through port substitution
- Clear boundary between application and infrastructure
- Multiple adapters per port (e.g., REST and GraphQL for the same use case)
- Framework-agnostic core

### Cons

- Port/adapter proliferation for simple operations
- DI configuration becomes complex and is another place the agent must check
- No manifest declaring all ports and their adapters
- Agent must understand hexagonal concepts to navigate
- Feature code is split across core/, adapters/, and config/

---

## Layered Architecture

### File Organization

```
src/
  controllers/
    UserController.ts
    OrderController.ts
  services/
    UserService.ts
    OrderService.ts
  repositories/
    UserRepository.ts
    OrderRepository.ts
  models/
    User.ts
    Order.ts
  middlewares/
    auth.ts
    validation.ts
```

The simplest and most common pattern. Code is grouped by technical layer: controllers handle HTTP, services contain business logic, repositories handle persistence.

### AI Agent Discovery

An agent scans directory names and guesses the layer structure. For "fix user creation," it checks `controllers/UserController.ts`, `services/UserService.ts`, `repositories/UserRepository.ts`, and `models/User.ts`. Discovery relies entirely on naming conventions -- the agent assumes files named `User*` in each layer directory are related.

### Change Impact Analysis

No mechanism at all. The agent must trace function calls through layers. In a large project with dozens of services, this means reading many files to understand which service calls which repository and which controller calls which service.

### Pros

- Simple and familiar
- Low learning curve
- Works well for small projects
- Widely understood across all frameworks

### Cons

- Worst-case scenario for AI agents: maximum scatter across directories
- No contracts, no manifests, no explicit boundaries
- Difficult to determine change impact
- Scales poorly: directories grow large with unrelated files mixed together
- God services emerge (UserService handling creation, deletion, search, etc.)

---

## Vertical Slice Architecture

### File Organization

```
src/
  features/
    CreateUser/
      CreateUserCommand.ts
      CreateUserHandler.ts
      CreateUserValidator.ts
      CreateUserEndpoint.ts
    GetUser/
      GetUserQuery.ts
      GetUserHandler.ts
      GetUserEndpoint.ts
    UpdateUser/
      UpdateUserCommand.ts
      UpdateUserHandler.ts
      UpdateUserValidator.ts
      UpdateUserEndpoint.ts
  shared/
    Database.ts
    EmailService.ts
```

Code is organized by feature/operation. Each slice contains everything needed for that feature: command/query, handler, validator, endpoint. This is the closest existing pattern to AACA.

### AI Agent Discovery

Much better than layered approaches. For "fix user creation," the agent goes directly to `features/CreateUser/`. All related code is in one directory.

However, there is no manifest declaring what is in each slice, no contracts defining inputs and outputs, and no machine-readable dependency information. The agent still needs to read all files in the slice to understand it.

### Change Impact Analysis

Better within a slice (everything is co-located), but cross-slice dependencies are not declared. If CreateUser depends on a shared EmailService, this is only visible by reading import statements.

### Pros

- Feature co-location: all code for one feature in one place
- Easy to add new features without touching existing code
- Minimal cross-feature coupling
- Scales well for large projects
- Closest to how humans think about systems ("what does it do?")

### Cons

- No machine-readable manifests or contracts
- No explicit dependency declarations between slices
- No standardized context files for agent orientation
- Shared code organization is ad-hoc
- No built-in validation of structure

---

## Microservices

### File Organization

Microservices is primarily a deployment architecture, not a code organization pattern. Each microservice can internally use any of the above patterns.

```
user-service/           # One deployable unit
  src/
    ... (any pattern)
order-service/          # Another deployable unit
  src/
    ... (any pattern)
api-gateway/
  src/
    ...
```

### AI Agent Discovery

At the service level, discovery depends on service registries, API gateways, or documentation. Within a service, discovery depends on the chosen internal architecture.

The agent must first figure out which service handles the feature, then navigate that service's internal structure. With no standardized manifests, the agent may need to check multiple services.

### Change Impact Analysis

API contracts between services (OpenAPI, protobuf, GraphQL schemas) provide some boundary information. But within a service, change impact analysis depends entirely on the internal architecture.

### Pros

- Independent deployment and scaling
- Technology diversity (each service can use different languages/frameworks)
- Team autonomy
- Clear service boundaries

### Cons

- Distributed system complexity
- Inter-service contracts are often maintained separately from code
- No unified manifest across services
- Agent must navigate multiple repositories
- Internal code organization is not standardized

---

## Comparison Summary

| Dimension | Layered | Clean | Hexagonal | Vertical Slice | Microservices | AACA |
|---|---|---|---|---|---|---|
| **Feature co-location** | None | Partial | Partial | High | Per-service | Complete |
| **Machine-readable manifests** | No | No | No | No | Partial (API specs) | Yes |
| **Contracts for all interfaces** | No | No | Ports (code only) | No | API specs (external) | Yes |
| **Context files** | No | No | No | No | No | Yes |
| **Explicit dependencies** | No | Via DI | Via ports/DI | No | Via API calls | Yes |
| **Change impact analysis** | Manual | Manual | Partial (ports) | Manual (within slice) | Partial (APIs) | Automated |
| **Agent discovery speed** | Slow | Medium | Medium | Fast | Varies | Fastest |
| **Files to read for one feature** | 4-6+ | 4-6+ | 5-8+ | 3-5 | Varies | 2-4 |

---

## AACA: What It Adds

AACA takes the best idea from Vertical Slice Architecture (organize by feature) and adds what is missing for AI agents:

1. **Manifests** (from nowhere -- this is new): Machine-readable declarations of what exists and how it connects
2. **Contracts** (inspired by Hexagonal ports, but richer): Full input/output/error/side-effect declarations in YAML
3. **Context files** (from nowhere -- this is new): Human-readable orientation at every directory level
4. **Explicit change boundaries** (from nowhere -- this is new): Declared dependency graphs that enable automated change impact analysis
5. **Rationale files** (from nowhere -- this is new): Encoded design decisions that prevent agents from undoing intentional trade-offs

AACA is not a replacement for these architectures -- it is an evolution that adds the metadata layer AI agents need. You can apply AACA principles to a Clean Architecture project by adding manifests, contracts, and context files to your existing structure. The operations-over-layers organization is recommended but not strictly required.
