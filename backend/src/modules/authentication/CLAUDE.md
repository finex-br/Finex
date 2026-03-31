# Authentication Module

## Domínio

Cadastro e login de usuários com JWT. OAuth existe no código mas está **DESABILITADO** — só email/password está ativo.

### Entidades
- **User** — aggregate root com Email, Password (bcrypt hash), PhoneNumber, UserRole, firstName, lastName
- **SocialAccount** — vinculação OAuth (inativa)

### Value Objects
- `Email` — validação de formato
- `Password` — hash bcrypt, validação de complexidade
- `PhoneNumber` — formato brasileiro
- `UserRole` — ADMIN | ENTREPRENEUR (default) | INVESTOR
- `SocialProvider`, `SocialAccountId` — OAuth (desabilitado)

## Fluxos Principais

**SignUp**: cria User + Company + CompanyMember numa transação (o fundador vira ADMIN da empresa)
**SignIn**: valida email/password → retorna JWT token

## DI Tokens
```
'IUserRepository'      → UserRepository
'ITokenService'        → JwtTokenService
'ISocialAccountRepository' → SocialAccountRepository
```

## Exports
`UserRepository`, `SocialAccountRepository`, `JwtTokenService` — usados por outros módulos para auth guards.

## Guards
`JwtAuthGuard` em `presentation/http/guards/` — importado por todos os módulos que precisam de autenticação.

## Testes
Cada value object e entity tem `.spec.ts` co-localizado. Use cases testados com mocks dos repositories.
