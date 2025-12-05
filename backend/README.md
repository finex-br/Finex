# 🚀 FinEx Backend - Sistema Completo de Autenticação

## ✅ Status Atual: 88 testes passando

Backend do sistema FinEx construído com Clean Architecture, Domain-Driven Design (DDD) e Test-Driven Development (TDD).

## 🚀 Início Rápido

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Ambiente
```bash
cp .env.example .env
# Edite o .env com suas configurações
```

### 3. Rodar Testes (TDD)
```bash
npm run test:watch  # Modo watch (recomendado)
npm test           # Rodar todos os testes
npm run test:cov   # Cobertura de testes
```

### 4. Rodar Servidor
```bash
npm run start:dev
```

**📚 Guias Completos:**
- [Getting Started](./docs/getting-started.md)
- [Plano de Autenticação](./docs/authentication-plan.md)

## Stack Tecnológica

- **Framework**: NestJS
- **Linguagem**: TypeScript
- **Banco de Dados**: PostgreSQL (migrar para DuckDB futuramente)
- **Cache**: Redis
- **ORM**: TypeORM
- **Autenticação**: JWT + OAuth 2.0 (Google, GitHub, Apple)
- **Testes**: Jest (TDD)
- **Validação**: class-validator

## Arquitetura

Este projeto segue os princípios de **Clean Architecture** e **Domain-Driven Design (DDD)**, com as seguintes camadas:

### 1. Domain (Camada de Domínio)
- Entidades e Agregados
- Value Objects
- Interfaces de Repositórios (Ports)
- Eventos de Domínio

### 2. Application (Camada de Aplicação)
- Use Cases (Casos de Uso)
- Queries
- DTOs
- Subscribers (Event Handlers)

### 3. Infrastructure (Camada de Infraestrutura)
- Implementação de Repositórios
- Adapters para serviços externos
- Persistência (TypeORM)
- Módulos NestJS

### 4. Presentation (Camada de Apresentação)
- Controllers HTTP
- View Models
- Validação de entrada

## Estrutura de Pastas

```
backend/
├── src/
│   ├── shared/              # Código compartilhado (Kernel)
│   │   ├── core/           # Classes base do DDD
│   │   ├── domain/         # Eventos de domínio
│   │   └── infra/          # Utilitários técnicos
│   │
│   ├── modules/            # Módulos da aplicação
│   │   └── authentication/ # Módulo de autenticação
│   │       ├── domain/
│   │       ├── application/
│   │       ├── infrastructure/
│   │       └── presentation/
│   │
│   ├── app.module.ts
│   └── main.ts
│
└── test/                   # Testes E2E
```

## Configuração

1. Instalar dependências:
```bash
npm install
```

2. Configurar variáveis de ambiente:
```bash
cp .env.example .env
```

3. Configurar banco de dados no arquivo `.env`

4. Executar em desenvolvimento:
```bash
npm run start:dev
```

## Testes (TDD)

### Metodologia Test-Driven Development

Este projeto segue rigorosamente o TDD:
1. 🔴 **RED**: Escrever teste que falha
2. 🟢 **GREEN**: Implementar código mínimo
3. 🔵 **REFACTOR**: Melhorar mantendo testes passando

### Comandos de Teste

```bash
# Modo watch (recomendado para TDD)
npm run test:watch

# Testes unitários
npm run test

# Testes com cobertura
npm run test:cov

# Testes E2E
npm run test:e2e

# Debug de testes
npm run test:debug
```

### Cobertura de Testes
- Meta: **> 80%** de cobertura
- Testes unitários para Domain e Application
- Testes de integração para Infrastructure
- Testes E2E para Presentation

## Desenvolvimento

### Workflow TDD
```bash
# 1. Instalar dependências
npm install

# 2. Iniciar testes em modo watch
npm run test:watch

# 3. Em outro terminal, iniciar servidor
npm run start:dev
```

### Estrutura de um Módulo
Cada módulo segue o padrão DDD:
```
module-name/
├── domain/              # Lógica de negócio pura
│   ├── entities/
│   ├── value-objects/
│   ├── events/
│   └── ports/          # Interfaces
├── application/        # Casos de uso
│   ├── use-cases/
│   ├── queries/
│   ├── dtos/
│   └── subscribers/
├── infrastructure/     # Implementação técnica
│   ├── persistence/
│   ├── adapters/
│   └── module.ts
└── presentation/       # Pontos de entrada
    └── http/
        ├── controllers/
        └── view-models/
```

## Módulos Disponíveis

### Authentication (✅ Fase 1 Completa)

#### Fase 1: Autenticação Local ✅
- ✅ Registro de usuários (Sign Up) com validação de phoneNumber
- ✅ Login (Sign In)
- ✅ Autenticação JWT
- ✅ Validação de email, senha e telefone
- ✅ Role padrão: ENTREPRENEUR (todos usuários são empresários)
- ✅ Campos obrigatórios: email, senha, nome, telefone

**API Endpoints:**

```bash
# Sign Up (Cadastro)
POST /auth/sign-up
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "StrongPass123!",
  "name": "John Doe",
  "phoneNumber": "+5511987654321"
}

# Sign In (Login)
POST /auth/sign-in
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "StrongPass123!"
}
```

**Validações Implementadas:**
- Email: Formato válido, único no sistema
- Senha: Mínimo 8 caracteres, uppercase, lowercase, número e caractere especial
- Telefone: Formato E.164 brasileiro (+5511987654321), 10-11 dígitos
- Nome: Mínimo 2 caracteres
- Role: Sempre ENTREPRENEUR (não é mais solicitado no cadastro)

#### Fase 2: Autenticação Social 🔜
- [ ] Login com Google OAuth 2.0
- [ ] Login com GitHub OAuth 2.0
- [ ] Login com Apple Sign In
- [ ] Vincular múltiplas contas sociais

**Detalhes**: Ver [Plano de Autenticação](./docs/authentication-plan.md)

## Próximos Passos

### Sprint 1: Domain Layer (Atual)
1. ✅ Setup do projeto
2. 🎯 Email Value Object + Testes
3. 🎯 Password Value Object + Testes
4. 🎯 UserRole Value Object + Testes
5. 🎯 User Entity + Testes

### Sprints Futuras
- Sprint 2: Application Layer (Use Cases)
- Sprint 3: Infrastructure Layer (Repository, JWT)
- Sprint 4: Presentation Layer (Controllers, E2E)
- Sprint 5: OAuth Social Authentication
