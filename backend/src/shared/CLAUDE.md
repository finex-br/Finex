# Shared Kernel

## Core (`core/`)
Building blocks DDD usados por todos os módulos:

- **Entity** — classe abstrata com `UniqueEntityID`, comparação por identidade
- **ValueObject** — classe abstrata, comparação por valor (props imutáveis)
- **Result\<T\>** — `Result.ok(value)`, `Result.fail(error)`, `Result.combine(results[])`. Checar `isFailure`/`isSuccess` antes de `getValue()`
- **UniqueEntityID** — wrapper de UUID, aceita string ou gera novo
- **UseCaseInterface** — `IUseCase<Request, Response>` genérico
- **DomainEvent** — base para eventos de domínio

## Domain Entities (`domain/entities/`)
- **Company** — empresa/organização (CNPJ, nome, etc.)
- **CompanyMember** — vínculo user↔company com role (OWNER|VIEWER) e isActive

## Value Objects (`domain/value-objects/`)
- **CNPJ** — validação de CNPJ brasileiro (dígitos verificadores)

## Repository Interfaces (`domain/repositories/`)
- `ICompanyRepository`, `ICompanyMemberRepository` — usados cross-module

## Infrastructure
- **EnvService** (`infra/env/`) — wrapper ConfigService. Acesso: `envService.databaseUrl`, `envService.jwtSecret`, etc.
- **TypeORM Schemas** (`infra/database/typeorm/entities/`) — CompanySchema, CompanyMemberSchema
- **Repositories** (`infra/database/typeorm/repositories/`) — implementações TypeORM

## Tenant (`tenant/`)
- **CompanyContext** — extrai `x-company-id` do request header para isolamento multi-tenant
