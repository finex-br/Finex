# Guia de Início Rápido - FinEx Backend

## 1. Instalação das Dependências

```bash
cd backend
npm install
```

### Dependências Instaladas:
- **NestJS**: Framework backend
- **TypeORM**: ORM para banco de dados
- **Jest**: Framework de testes
- **Passport**: Autenticação (JWT + OAuth)
- **bcrypt**: Hash de senhas
- **class-validator/transformer**: Validação de DTOs

## 2. Configurar Variáveis de Ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações.

## 3. Rodar os Testes (TDD)

```bash
# Modo watch (recomendado para TDD - atualiza a cada mudança)
npm run test:watch

# Rodar todos os testes
npm test

# Cobertura de testes
npm run test:cov
```

## 4. Rodar o Servidor de Desenvolvimento

```bash
npm run start:dev
```

O servidor estará disponível em: `http://localhost:3000/api`

## 5. Workflow TDD

### Ciclo Red-Green-Refactor:

1. **🔴 RED**: Escreva um teste que falha
   ```typescript
   // email.spec.ts
   it('should create valid email', () => {
     const result = Email.create('test@example.com');
     expect(result.isSuccess).toBe(true);
   });
   ```

2. **🟢 GREEN**: Implemente o código mínimo para passar
   ```typescript
   // email.ts
   static create(value: string): Result<Email> {
     return Result.ok(new Email({ value }));
   }
   ```

3. **🔵 REFACTOR**: Melhore o código mantendo os testes passando
   ```typescript
   // email.ts
   static create(value: string): Result<Email> {
     if (!value) return Result.fail('Email required');
     if (!this.isValid(value)) return Result.fail('Invalid email');
     return Result.ok(new Email({ value: value.toLowerCase() }));
   }
   ```

## 6. Estrutura de Arquivos

```
src/
├── shared/              # Código compartilhado (DDD Core)
│   ├── core/           # Entity, ValueObject, Result, etc.
│   ├── domain/         # Domain Events
│   └── infra/          # Infraestrutura técnica
│
└── modules/            # Módulos da aplicação
    └── authentication/ # Módulo de autenticação
        ├── domain/
        ├── application/
        ├── infrastructure/
        └── presentation/
```

## 7. Comandos Úteis

```bash
# Gerar um novo módulo
nest g module modules/nome-do-modulo

# Gerar um controller
nest g controller modules/nome-do-modulo

# Gerar um service
nest g service modules/nome-do-modulo

# Build para produção
npm run build

# Rodar em produção
npm run start:prod
```

## 8. Próximos Passos

Siga o plano em `docs/authentication-plan.md`:

1. ✅ Dependências instaladas
2. 🎯 Sprint 1: Começar com Value Objects (Email, Password, UserRole)
3. 🎯 Sprint 2: Implementar Entities (User)
4. 🎯 Sprint 3: Use Cases (SignUp, SignIn)
5. 🎯 Sprint 4: Infrastructure (Repository, JWT)
6. 🎯 Sprint 5: Presentation (Controllers, E2E)

## 9. Dicas de TDD

- ✅ Escreva o teste ANTES do código
- ✅ Faça pequenos incrementos
- ✅ Rode os testes frequentemente
- ✅ Mantenha cobertura > 80%
- ✅ Testes devem ser independentes
- ✅ Use nomes descritivos nos testes

## 10. Estrutura de um Teste

```typescript
import { Email } from './email';

describe('Email Value Object', () => {
  describe('create', () => {
    it('should create a valid email', () => {
      // Arrange (preparar)
      const validEmail = 'user@example.com';

      // Act (agir)
      const result = Email.create(validEmail);

      // Assert (verificar)
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe('user@example.com');
    });

    it('should fail when email is empty', () => {
      const result = Email.create('');
      expect(result.isFailure).toBe(true);
    });

    it('should fail when email format is invalid', () => {
      const result = Email.create('invalid-email');
      expect(result.isFailure).toBe(true);
    });

    it('should normalize email to lowercase', () => {
      const result = Email.create('USER@EXAMPLE.COM');
      expect(result.getValue().value).toBe('user@example.com');
    });
  });
});
```

---

**🚀 Pronto para começar! Execute `npm install` e depois `npm run test:watch`**
