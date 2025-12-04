# Plano de Desenvolvimento - Módulo de Autenticação (TDD)

## Estratégia de Autenticação

### Fase 1: Autenticação Local (Email/Senha) ✅ Vamos começar aqui
- Registro de usuário
- Login com email e senha
- JWT tokens
- Refresh tokens
- Recuperação de senha

### Fase 2: Autenticação Social (OAuth 2.0) 🔜 Futuro
Após terminar a Fase 1, implementaremos:

#### Providers Suportados:
- **Google OAuth 2.0** (`passport-google-oauth20`)
- **GitHub OAuth 2.0** (`passport-github2`)
- **Apple Sign In** (`passport-apple`)

#### Fluxo OAuth:
1. Usuário clica em "Login com Google/GitHub/Apple"
2. Redirecionamento para provider
3. Usuário autoriza
4. Callback com token
5. Criação/login de usuário no sistema
6. Retorno de JWT próprio

#### Estrutura Planejada:
```
authentication/
├── domain/
│   ├── entities/
│   │   ├── user.ts
│   │   └── social-account.ts  ← Nova entidade para vincular contas sociais
│   └── value-objects/
│       ├── email.ts
│       ├── password.ts (opcional para OAuth)
│       └── social-provider.ts  ← Enum: GOOGLE, GITHUB, APPLE
│
├── infrastructure/
│   └── adapters/
│       ├── jwt-token.service.ts
│       ├── google-auth.strategy.ts    ← Passport Strategy
│       ├── github-auth.strategy.ts    ← Passport Strategy
│       └── apple-auth.strategy.ts     ← Passport Strategy
```

## Ordem de Desenvolvimento TDD

### Sprint 1: Domain Layer (Pure Business Logic)
1. **Value Objects** (Red → Green → Refactor)
   - [ ] Email Value Object + Tests
   - [ ] Password Value Object + Tests
   - [ ] UserRole Value Object + Tests

2. **Entities** (Red → Green → Refactor)
   - [ ] User Entity + Tests
   - [ ] User creation rules
   - [ ] User state transitions (activate, deactivate)

3. **Domain Events** (Red → Green → Refactor)
   - [ ] UserCreatedEvent + Tests
   - [ ] UserActivatedEvent + Tests

### Sprint 2: Application Layer (Use Cases)
4. **Use Cases** (Red → Green → Refactor)
   - [ ] SignUpUseCase + Tests
   - [ ] SignInUseCase + Tests
   - [ ] RefreshTokenUseCase + Tests
   - [ ] RequestPasswordResetUseCase + Tests
   - [ ] ResetPasswordUseCase + Tests

### Sprint 3: Infrastructure Layer (Technical Implementation)
5. **Repository Implementation** (Red → Green → Refactor)
   - [ ] InMemoryUserRepository (para testes)
   - [ ] TypeORMUserRepository + Integration Tests

6. **Adapters** (Red → Green → Refactor)
   - [ ] JwtTokenService + Tests
   - [ ] BcryptPasswordHasher + Tests

### Sprint 4: Presentation Layer (HTTP)
7. **Controllers** (Red → Green → Refactor)
   - [ ] AuthController + E2E Tests
   - [ ] Validation Pipes
   - [ ] Error Handling

### Sprint 5: OAuth Social Authentication (FUTURO)
8. **Social Auth Strategies**
   - [ ] Google Strategy + Tests
   - [ ] GitHub Strategy + Tests
   - [ ] Apple Strategy + Tests
   - [ ] SocialAccount Entity
   - [ ] LinkSocialAccountUseCase

## Configuração OAuth (Para Fase 2)

### Google OAuth
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
```

### GitHub OAuth
```env
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:3000/api/auth/github/callback
```

### Apple Sign In
```env
APPLE_CLIENT_ID=your_apple_client_id
APPLE_TEAM_ID=your_apple_team_id
APPLE_KEY_ID=your_apple_key_id
APPLE_CALLBACK_URL=http://localhost:3000/api/auth/apple/callback
APPLE_PRIVATE_KEY_PATH=./keys/apple-private-key.p8
```

## Endpoints Planejados

### Fase 1 (Local Auth)
- `POST /api/auth/sign-up` - Registro
- `POST /api/auth/sign-in` - Login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/forgot-password` - Solicitar reset
- `POST /api/auth/reset-password` - Resetar senha
- `POST /api/auth/logout` - Logout

### Fase 2 (Social Auth)
- `GET /api/auth/google` - Iniciar OAuth Google
- `GET /api/auth/google/callback` - Callback Google
- `GET /api/auth/github` - Iniciar OAuth GitHub
- `GET /api/auth/github/callback` - Callback GitHub
- `GET /api/auth/apple` - Iniciar OAuth Apple
- `POST /api/auth/apple/callback` - Callback Apple

## Próximos Passos Imediatos

1. ✅ Instalar dependências: `npm install`
2. 🎯 Começar TDD com Email Value Object
3. 🎯 Criar primeiro teste que falha (RED)
4. 🎯 Implementar código mínimo (GREEN)
5. 🎯 Refatorar (REFACTOR)

## Como Rodar os Testes

```bash
# Testes unitários
npm test

# Testes em modo watch (recomendado para TDD)
npm run test:watch

# Testes com cobertura
npm run test:cov

# Testes E2E
npm run test:e2e
```

## Estrutura de Teste

```typescript
// Exemplo de teste TDD
describe('Email Value Object', () => {
  it('should create a valid email', () => {
    const emailOrError = Email.create('user@example.com');
    expect(emailOrError.isSuccess).toBe(true);
  });

  it('should fail with invalid email format', () => {
    const emailOrError = Email.create('invalid-email');
    expect(emailOrError.isFailure).toBe(true);
    expect(emailOrError.error).toContain('invalid');
  });
});
```

---

**🎯 FOCO AGORA: Sprint 1 - Domain Layer com TDD**
