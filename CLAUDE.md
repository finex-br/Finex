# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FinEx is a financial intelligence, governance, and valuation platform (Brazilian market). Monorepo with a NestJS backend and React + Vite frontend. The project language is Portuguese for documentation and domain concepts, but all code (files, variables, classes) is in English.

## Commands

### Backend (run from `backend/`)

| Command | Purpose |
|---------|---------|
| `npm run start:dev` | Dev server with watch mode (port 3000) |
| `npm run test` | Run all tests (Jest) |
| `npm run test:watch` | TDD watch mode |
| `npm run test -- --testPathPattern=authentication` | Run tests for a specific module |
| `npm run test -- path/to/file.spec.ts` | Run a single test file |
| `npm run test:e2e` | E2E tests (uses `test/jest-e2e.json`) |
| `npm run test:cov` | Coverage report |
| `npm run lint` | ESLint with auto-fix |
| `npm run lint:check` | ESLint without fix |
| `npm run type-check` | TypeScript check (`tsc --noEmit`) |
| `npm run build` | Production build (`nest build`) |
| `docker compose up` | Start PostgreSQL on port 5433 |

### Frontend (run from `frontend/`)

| Command | Purpose |
|---------|---------|
| `npm run dev` | Vite dev server (port 8080) |
| `npm run test` | Run all tests (Vitest) |
| `npm run test:watch` | Vitest watch mode |
| `npm run build` | Production build |
| `npm run lint` | ESLint |

## Architecture

### DDD + Clean Architecture (Backend)

The backend follows strict Domain-Driven Design with Clean Architecture. Each module in `backend/src/modules/` is a bounded context with four layers:

```
modules/<name>/
├── domain/            # Layer 1: Pure business rules (zero dependencies)
│   ├── entities/      # Aggregates with identity and lifecycle
│   ├── value-objects/  # Immutable objects compared by value (Email, Password, PhoneNumber)
│   ├── events/        # Domain events (UserCreatedEvent, etc.)
│   └── ports/         # Repository interfaces (contracts)
│
├── application/       # Layer 2: Use cases orchestrating domain logic
│   ├── use-cases/     # Command operations (Create, Update)
│   ├── queries/       # Read operations (Get, List)
│   ├── dtos/          # Input/output contracts
│   └── subscribers/   # Event handlers
│
├── infrastructure/    # Layer 3: Technical implementations
│   ├── persistence/typeorm/
│   │   ├── entities/      # TypeORM schemas (*.schema.ts)
│   │   ├── mappers/       # Domain <-> Schema converters
│   │   └── repositories/  # Port implementations
│   ├── adapters/      # External service integrations
│   └── module.ts      # NestJS module wiring
│
└── presentation/      # Layer 4: HTTP interface
    └── http/
        ├── controllers/
        └── view-models/   # Response formatters
```

**Dependency rule**: Dependencies point inward only. Domain has no imports from other layers. Application depends only on domain. Infrastructure implements domain ports.

### Shared Kernel (`backend/src/shared/`)

Base DDD building blocks used across all modules:
- `core/entity.ts` — Abstract base entity with `UniqueEntityID`
- `core/value-object.ts` — Abstract base value object
- `core/result.ts` — `Result<T>` pattern for error handling (no exceptions)
- `core/use-case.interface.ts` — Generic use case contract
- `shared/domain/events/` — Domain event infrastructure
- `shared/infra/env/` — `EnvService` wrapping NestJS ConfigService
- `shared/infra/database/` — Shared entities (Company, CompanyMember)
- `shared/infra/tenant/` — Multi-tenant support

### Active Modules

- **authentication** — Email/password sign-up/sign-in with JWT. OAuth infrastructure exists but is disabled.
- **survey** — Business maturity assessments: surveys, versions, questions, assessments, answers.
- **financial** — Excel upload and processing, document approval workflows.
- **payment** — Asaas gateway integration, subscription management.
- **company** — Company/organization management, multi-tenant isolation.

### Frontend Architecture (`frontend/src/`)

- **UI**: shadcn-ui components (Radix primitives + TailwindCSS) in `components/ui/`
- **State**: Zustand stores with localStorage persistence (`store/authStore`)
- **Routing**: react-router-dom with protected route wrappers
- **API**: Axios services in `services/`, React Query for data fetching
- **Forms**: react-hook-form + zod validation
- **Pattern**: Some views use MVVM via `hooks/use*ViewModel.ts`

## Key Patterns to Follow

- **Result pattern**: Use cases return `Result<T>` instead of throwing exceptions. Check `result.isFailure` before proceeding.
- **Mapper pattern**: Always convert between domain entities and TypeORM schemas via mapper classes — never use TypeORM entities as domain objects.
- **Value objects**: Domain primitives (Email, Password, PhoneNumber, UserRole) are value objects with validation in their `create()` factory methods.
- **Repository interfaces**: Define in `domain/ports/`, implement in `infrastructure/persistence/`. Inject via NestJS DI using string tokens.
- **TypeORM schemas**: Use `*.schema.ts` suffix. TypeORM entity discovery relies on the `**/*.schema{.ts,.js}` glob.
- **TDD workflow**: Write failing test first, make it pass, refactor. Backend targets >80% coverage.

## Environment

Backend requires a `.env` file (copy from `.env.example`). Key variables:
- `DATABASE_URL` — PostgreSQL connection string (dev Docker uses port 5433)
- `JWT_SECRET` / `JWT_EXPIRES_IN` — Auth token configuration
- `REDIS_URL` — Cache connection
- `ASAAS_API_KEY` / `ASAAS_ENVIRONMENT` — Payment gateway (sandbox for dev)

Frontend uses `VITE_API_URL` (default: `http://localhost:3000`).

## CI/CD

GitHub Actions workflow (`.github/workflows/backend-ci.yml`) runs lint, type-check, and tests on push/PR to main.
