# Backend

## Bootstrap
NestJS app com TypeORM (PostgreSQL). Entity discovery via glob `**/*.schema{.ts,.js}`.
Módulos: Authentication, Company, Financial, Payment, Survey — todos importados em `app.module.ts`.

## Multi-tenant
Header `x-company-id` identifica a empresa ativa. `CompanyContext` (shared/tenant/) extrai do request.

## DI Convention
- Repository interfaces como string tokens: `'IUserRepository'`, `'IFinancialRepository'`, etc.
- Use cases registrados via `useFactory` + `inject` nos module files
- Guards (JwtAuthGuard) importados do authentication module

## EnvService
Wrapper do NestJS ConfigService em `shared/infra/env/`. Usado para JWT_SECRET, DATABASE_URL, etc.
Importar via `EnvModule` — disponível globalmente.

## TypeORM
- Schemas usam sufixo `*.schema.ts` (não `.entity.ts` para a infra layer)
- `synchronize: false` — migrações manuais
- PostgreSQL na porta 5433 (Docker dev)

## Testes
- Jest com `--testPathPattern` para módulos específicos
- Cada domínio tem `.spec.ts` co-localizados
- `npm run test:e2e` usa config separada (`test/jest-e2e.json`)
- Target: >80% coverage

## Health Check
`GET /health` — retorna `{ status: 'ok', timestamp }` (definido no AppController).
