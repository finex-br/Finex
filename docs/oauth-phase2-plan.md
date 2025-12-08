# 🚀 Fase 2: OAuth Social Authentication - Plano TDD

## 📋 Visão Geral

Implementar autenticação via OAuth 2.0 com Google, GitHub e Apple, seguindo **TDD rigoroso** e mantendo Clean Architecture.

## 🎯 Objetivos

1. Permitir login/registro via Google, GitHub e Apple
2. Vincular múltiplas contas sociais ao mesmo usuário
3. Manter compatibilidade com autenticação local
4. Garantir segurança e validação de tokens

## 📦 Dependências a Instalar

```bash
npm install @nestjs/passport passport
npm install passport-google-oauth20 passport-github2 passport-apple passport-facebook
npm install @types/passport-google-oauth20 @types/passport-github2 @types/passport-facebook --save-dev
```

## 🏗️ Estrutura de Desenvolvimento (TDD)

### Sprint 1: Domain Layer (Semana 1)

#### 1.1 Value Objects
**Arquivos:** `src/modules/authentication/domain/value-objects/`

- [x] **SocialProvider** (enum)
  - Testes: GOOGLE, GITHUB, APPLE, FACEBOOK
  - Validação de provider válido
  - Case-insensitive
  - **Estimativa:** 30min (14 testes)

- [ ] **SocialAccountId**
  - ID único fornecido pelo provider
  - Validação não-vazio
  - **Estimativa:** 20min (6 testes)

#### 1.2 Entities
**Arquivos:** `src/modules/authentication/domain/entities/`

- [ ] **SocialAccount** (nova entidade)
  - Propriedades: id, userId, provider, providerId, email, displayName, avatarUrl
  - Vincular/desvincular de User
  - Validação de dados obrigatórios
  - **Estimativa:** 1h (15 testes)

- [ ] **User** (atualização)
  - Adicionar método `linkSocialAccount()`
  - Adicionar método `unlinkSocialAccount()`
  - Validar que email social não conflita
  - **Estimativa:** 45min (10 testes)

#### 1.3 Domain Events
**Arquivos:** `src/modules/authentication/domain/events/`

- [ ] **SocialAccountLinkedEvent**
  - Disparado ao vincular conta social
  - **Estimativa:** 15min (3 testes)

- [ ] **UserRegisteredViaSocialEvent**
  - Disparado ao criar usuário via OAuth
  - **Estimativa:** 15min (3 testes)

**Total Sprint 1:** ~3h30min | ~37 testes

---

### Sprint 2: Application Layer (Semana 1-2)

#### 2.1 DTOs
**Arquivos:** `src/modules/authentication/application/dtos/`

- [ ] **SocialAuthDTO**
  - provider, providerId, email, name, avatarUrl
  - **Estimativa:** 15min

- [ ] **SocialAuthResponseDTO**
  - token, user, isNewUser
  - **Estimativa:** 10min

#### 2.2 Ports (Interfaces)
**Arquivos:** `src/modules/authentication/domain/ports/`

- [ ] **ISocialAccountRepository**
  - findByProviderAndProviderId()
  - findByUserId()
  - save()
  - delete()
  - **Estimativa:** 20min

#### 2.3 Use Cases
**Arquivos:** `src/modules/authentication/application/use-cases/`

- [ ] **AuthenticateWithSocialUseCase**
  - Buscar conta social existente
  - Se não existe, criar User + SocialAccount
  - Se existe, fazer login
  - Gerar JWT
  - Disparar eventos
  - **Estimativa:** 2h (12 testes)

- [ ] **LinkSocialAccountUseCase**
  - Usuário já logado vincula nova conta social
  - Validar que provider não está vinculado
  - Validar que email não conflita
  - **Estimativa:** 1h30min (10 testes)

- [ ] **UnlinkSocialAccountUseCase**
  - Remover vínculo de conta social
  - Validar que usuário tem outra forma de login
  - **Estimativa:** 1h (8 testes)

**Total Sprint 2:** ~5h | ~30 testes

---

### Sprint 3: Infrastructure Layer (Semana 2)

#### 3.1 Persistence
**Arquivos:** `src/modules/authentication/infrastructure/persistence/typeorm/`

- [ ] **SocialAccountSchema** (TypeORM Entity)
  - Mapeamento para tabela `social_accounts`
  - Relação ManyToOne com User
  - Índices: (provider, providerId), userId
  - **Estimativa:** 30min

- [ ] **SocialAccountMapper**
  - toDomain()
  - toPersistence()
  - **Estimativa:** 1h (8 testes)

- [ ] **SocialAccountRepository**
  - Implementação de ISocialAccountRepository
  - Queries TypeORM
  - **Estimativa:** 1h (6 testes)

#### 3.2 Passport Strategies
**Arquivos:** `src/modules/authentication/infrastructure/adapters/oauth/`

- [ ] **GoogleOAuthStrategy**
  - Configuração passport-google-oauth20
  - Validate method
  - Extract user profile
  - **Estimativa:** 1h30min (8 testes com mocks)

- [ ] **GitHubOAuthStrategy**
  - Configuração passport-github2
  - Validate method
  - Extract user profile
  - **Estimativa:** 1h30min (8 testes com mocks)

- [ ] **AppleOAuthStrategy**
  - Configuração passport-apple
  - Validate method
  - Handle private key
  - **Estimativa:** 2h (10 testes com mocks)

- [ ] **FacebookOAuthStrategy**
  - Configuração passport-facebook
  - Validate method
  - Extract user profile
  - **Estimativa:** 1h30min (8 testes com mocks)

**Total Sprint 3:** ~7h30min | ~40 testes

---

### Sprint 4: Presentation Layer (Semana 3)

#### 4.1 Guards
**Arquivos:** `src/modules/authentication/presentation/http/guards/`

- [ ] **GoogleOAuthGuard**
  - Extends AuthGuard('google')
  - **Estimativa:** 20min (2 testes)

- [ ] **GitHubOAuthGuard**
  - Extends AuthGuard('github')
  - **Estimativa:** 20min (2 testes)

- [ ] **AppleOAuthGuard**
  - Extends AuthGuard('apple')
  - **Estimativa:** 20min (2 testes)

#### 4.2 Controllers
**Arquivos:** `src/modules/authentication/presentation/http/controllers/`

- [ ] **OAuthController**
  - `GET /auth/google` - Inicia OAuth
  - `GET /auth/google/callback` - Callback
  - `GET /auth/github` - Inicia OAuth
  - `GET /auth/github/callback` - Callback
  - `GET /auth/apple` - Inicia OAuth
  - `POST /auth/apple/callback` - Callback
  - **Estimativa:** 2h (E2E tests)

- [ ] **SocialAccountController** (usuário logado)
  - `GET /auth/social-accounts` - Listar contas vinculadas
  - `POST /auth/social-accounts/link` - Vincular nova conta
  - `DELETE /auth/social-accounts/:provider` - Desvincular
  - **Estimativa:** 1h30min (E2E tests)

**Total Sprint 4:** ~4h30min | ~15 testes E2E

---

### Sprint 5: Configuration & Environment (Semana 3)

#### 5.1 Environment Variables
**Arquivo:** `.env.example`

```env
# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# GitHub OAuth
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_CALLBACK_URL=http://localhost:3000/auth/github/callback

# Apple Sign In
APPLE_CLIENT_ID=
APPLE_TEAM_ID=
APPLE_KEY_ID=
APPLE_CALLBACK_URL=http://localhost:3000/auth/apple/callback
APPLE_PRIVATE_KEY_PATH=./keys/apple-private-key.p8
```

#### 5.2 Module Configuration
**Arquivos:** `src/modules/authentication/infrastructure/`

- [ ] **AuthenticationModule** (update)
  - Registrar Passport Strategies
  - Configurar Guards
  - **Estimativa:** 1h

#### 5.3 Frontend Redirect
**Arquivo:** `src/modules/authentication/presentation/http/controllers/oauth.controller.ts`

- [ ] Implementar redirect para frontend com token
  - Success: `FRONTEND_URL/auth/callback?token=xxx`
  - Error: `FRONTEND_URL/auth/callback?error=xxx`
  - **Estimativa:** 30min

**Total Sprint 5:** ~2h

---

## 📊 Resumo de Estimativas

| Sprint | Foco | Tempo | Testes |
|--------|------|-------|--------|
| Sprint 1 | Domain Layer | ~3h30min | ~37 |
| Sprint 2 | Application Layer | ~5h | ~30 |
| Sprint 3 | Infrastructure | ~7h30min | ~40 |
| Sprint 4 | Presentation | ~4h30min | ~15 |
| Sprint 5 | Configuration | ~2h | - |
| **TOTAL** | | **~22h30min** | **~122 testes** |

## 🎯 Ordem de Implementação (TDD)

### Dia 1-2: Domain Foundation
1. ✅ SocialProvider Value Object (RED → GREEN → REFACTOR)
2. ✅ SocialAccountId Value Object
3. ✅ SocialAccount Entity
4. ✅ User.linkSocialAccount() method
5. ✅ Domain Events

### Dia 3-4: Application Logic
6. ✅ DTOs e Interfaces
7. ✅ AuthenticateWithSocialUseCase
8. ✅ LinkSocialAccountUseCase
9. ✅ UnlinkSocialAccountUseCase

### Dia 5-6: Infrastructure
10. ✅ Database Schema & Mapper
11. ✅ Repository Implementation
12. ✅ Google OAuth Strategy
13. ✅ GitHub OAuth Strategy
14. ✅ Apple OAuth Strategy

### Dia 7: Presentation & Integration
15. ✅ Guards
16. ✅ Controllers
17. ✅ E2E Tests
18. ✅ Environment Setup

## 🧪 Comandos TDD

```bash
# Watch mode durante desenvolvimento
npm run test:watch

# Filtrar testes específicos
npm run test:watch -- SocialProvider

# Rodar testes E2E
npm run test:e2e

# Cobertura final
npm run test:cov
```

## 📝 Checklist de Implementação

### Domain Layer
- [ ] SocialProvider VO (10 testes)
- [ ] SocialAccountId VO (6 testes)
- [ ] SocialAccount Entity (15 testes)
- [ ] User updates (10 testes)
- [ ] Domain Events (6 testes)

### Application Layer
- [ ] DTOs definidos
- [ ] ISocialAccountRepository port
- [ ] AuthenticateWithSocialUseCase (12 testes)
- [ ] LinkSocialAccountUseCase (10 testes)
- [ ] UnlinkSocialAccountUseCase (8 testes)

### Infrastructure Layer
- [ ] SocialAccountSchema
- [ ] SocialAccountMapper (8 testes)
- [ ] SocialAccountRepository (6 testes)
- [ ] GoogleOAuthStrategy (8 testes)
- [ ] GitHubOAuthStrategy (8 testes)
- [ ] AppleOAuthStrategy (10 testes)

### Presentation Layer
- [ ] OAuth Guards (6 testes)
- [ ] OAuthController (E2E)
- [ ] SocialAccountController (E2E)

### Configuration
- [ ] Environment variables
- [ ] Module registration
- [ ] Frontend redirect

## 🚀 Como Começar

```bash
# 1. Instalar dependências
npm install @nestjs/passport passport passport-google-oauth20 passport-github2 passport-apple

# 2. Criar branch para Fase 2
git checkout -b feature/oauth-phase2

# 3. Iniciar TDD com primeiro Value Object
npm run test:watch

# 4. Criar primeiro teste RED
# File: src/modules/authentication/domain/value-objects/social-provider.spec.ts
```

## 📚 Referências

- [Passport.js Documentation](http://www.passportjs.org/)
- [NestJS Passport Integration](https://docs.nestjs.com/security/authentication)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth Apps](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [Apple Sign In](https://developer.apple.com/sign-in-with-apple/)

---

**🎯 Próximo Passo:** Começar Sprint 1 - criar `social-provider.spec.ts` (RED)
