# Modules

## Estrutura por Módulo (4 camadas DDD)
```
domain/          → entities, value-objects, ports (interfaces), events
application/     → use-cases, queries, dtos, subscribers
infrastructure/  → persistence/typeorm (schemas, mappers, repos), adapters
presentation/    → http/controllers, view-models
```

## Dependências entre Módulos
- **authentication** → exporta UserRepository, JwtTokenService, JwtAuthGuard (consumido por todos)
- **survey** → importa CompanyRepository do shared, UserSchema do auth
- **financial** → importa UserSchema do auth, EnvService do shared
- **payment** → importa JwtAuthGuard e UserSchema do auth
- **company** → importa UserSchema e JwtAuthGuard do auth

## Convenção DI
Repositories injetados via string tokens: `'IUserRepository'`, `'ISurveyRepository'`, etc.
Use cases registrados via `useFactory` com `inject` explícito dos tokens.

## Module Files
Cada módulo tem seu NestJS module em:
- `authentication/infrastructure/authentication.module.ts`
- `survey/survey.module.ts`
- `financial/financial.module.ts`
- `payment/payment.module.ts`
- `company/company.module.ts`
