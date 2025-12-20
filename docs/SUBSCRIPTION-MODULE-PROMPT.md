# Prompt: Implementação do Módulo de Subscription

## 📋 Contexto

O projeto Finex já possui um **Payment Module** implementado com DDD/TDD que gerencia checkouts e pagamentos pontuais via Asaas. Agora precisamos implementar um **Subscription Module** para gerenciar planos de assinatura (mensal, trimestral, anual) e controlar o acesso dos usuários baseado em suas assinaturas.

---

## 🎯 Objetivo

Criar um módulo `Subscription` que:
- Gerencie diferentes planos de assinatura (mensal, trimestral, anual, lifetime)
- Controle o status e validade das assinaturas dos usuários
- Integre com o Payment Module para processar pagamentos
- Permita upgrades, downgrades e cancelamentos
- Implemente lógica de renovação automática
- Siga rigorosamente os padrões DDD/TDD já estabelecidos no projeto

---

## 🏗️ Arquitetura

### Estrutura de Pastas

```
backend/src/modules/subscription/
├── domain/
│   ├── entities/
│   │   ├── plan.ts
│   │   ├── plan.spec.ts
│   │   ├── subscription.ts
│   │   └── subscription.spec.ts
│   ├── value-objects/
│   │   ├── billing-cycle.ts
│   │   ├── billing-cycle.spec.ts
│   │   ├── subscription-status.ts
│   │   └── subscription-status.spec.ts
│   └── ports/
│       ├── plan-repository.interface.ts
│       └── subscription-repository.interface.ts
├── application/
│   ├── dtos/
│   │   ├── create-subscription.dto.ts
│   │   ├── subscription-response.dto.ts
│   │   └── plan-response.dto.ts
│   └── use-cases/
│       ├── create-subscription.use-case.ts
│       ├── create-subscription.use-case.spec.ts
│       ├── cancel-subscription.use-case.ts
│       ├── cancel-subscription.use-case.spec.ts
│       ├── get-active-subscription.use-case.ts
│       ├── get-active-subscription.use-case.spec.ts
│       ├── upgrade-subscription.use-case.ts
│       └── upgrade-subscription.use-case.spec.ts
├── infrastructure/
│   ├── persistence/
│   │   ├── typeorm/
│   │   │   ├── schemas/
│   │   │   │   ├── plan.schema.ts
│   │   │   │   └── subscription.schema.ts
│   │   │   ├── repositories/
│   │   │   │   ├── plan.repository.ts
│   │   │   │   └── subscription.repository.ts
│   │   │   └── mappers/
│   │   │       ├── plan.mapper.ts
│   │   │       ├── plan.mapper.spec.ts
│   │   │       ├── subscription.mapper.ts
│   │   │       └── subscription.mapper.spec.ts
│   └── services/
│       ├── subscription-expiry.service.ts
│       └── subscription-expiry.service.spec.ts
├── presentation/
│   ├── controllers/
│   │   ├── subscription.controller.ts
│   │   ├── plan.controller.ts
│   │   └── subscription-webhook.controller.ts
│   └── dtos/
│       ├── create-subscription-request.dto.ts
│       └── cancel-subscription-request.dto.ts
└── subscription.module.ts
```

---

## 📐 Domain Layer

### 1. Value Objects

#### BillingCycle
```typescript
export enum BillingCycleEnum {
  MONTHLY = 'MONTHLY',     // 30 dias
  QUARTERLY = 'QUARTERLY', // 90 dias
  ANNUAL = 'ANNUAL',       // 365 dias
  LIFETIME = 'LIFETIME',   // sem expiração
}

export class BillingCycle extends ValueObject<{ value: string }> {
  get value(): string;
  static create(cycle: string): Result<BillingCycle>;
  getDurationInDays(): number | null; // null para LIFETIME
  isRecurring(): boolean; // false para LIFETIME
}
```

**Testes obrigatórios:**
- ✅ Criar billing cycle válido
- ✅ Falhar com valor inválido
- ✅ Calcular duração em dias corretamente
- ✅ LIFETIME retorna null para duração

#### SubscriptionStatus
```typescript
export enum SubscriptionStatusEnum {
  ACTIVE = 'ACTIVE',       // Assinatura ativa
  TRIAL = 'TRIAL',         // Período de teste
  EXPIRED = 'EXPIRED',     // Expirou
  CANCELLED = 'CANCELLED', // Cancelada pelo usuário
  SUSPENDED = 'SUSPENDED', // Suspensa (falta de pagamento)
}

export class SubscriptionStatus extends ValueObject<{ value: string }> {
  get value(): string;
  static create(status: string): Result<SubscriptionStatus>;
  isActive(): boolean;
  canRenew(): boolean;
  canCancel(): boolean;
}
```

**Testes obrigatórios:**
- ✅ Criar status válido
- ✅ Falhar com valor inválido
- ✅ Verificar se status permite renovação
- ✅ Verificar se status permite cancelamento

---

### 2. Entities

#### Plan (Plano de Assinatura)
```typescript
interface PlanProps {
  name: string;              // "Premium Mensal"
  description: string;       // "Acesso completo por 30 dias"
  amount: Amount;            // R$ 29.90 (reusa do Payment Module)
  billingCycle: BillingCycle;
  features: string[];        // ["Upload ilimitado", "Relatórios avançados"]
  isActive: boolean;
  trialDays?: number;        // 7 dias de trial grátis
  createdAt: Date;
  updatedAt: Date;
}

export class Plan extends Entity<PlanProps> {
  get name(): string;
  get amount(): Amount;
  get billingCycle(): BillingCycle;
  get features(): string[];
  
  static create(props: PlanProps, id?: UniqueEntityID): Result<Plan>;
  
  updatePrice(newAmount: Amount): Result<void>;
  activate(): void;
  deactivate(): void;
  addFeature(feature: string): Result<void>;
  removeFeature(feature: string): Result<void>;
}
```

**Regras de Negócio:**
1. Nome obrigatório (mín 3, máx 100 caracteres)
2. Descrição obrigatória (mín 10, máx 500 caracteres)
3. Amount deve ser positivo
4. Features não pode ter duplicatas
5. Trial days entre 0 e 90 dias

**Testes obrigatórios (15+):**
- ✅ Criar plano válido
- ✅ Falhar com nome vazio/inválido
- ✅ Falhar com amount negativo
- ✅ Atualizar preço com sucesso
- ✅ Adicionar/remover features
- ✅ Validar trial days

#### Subscription (Assinatura do Usuário)
```typescript
interface SubscriptionProps {
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  startDate: Date;
  endDate: Date;              // calculado baseado no plano
  lastPaymentId?: string;     // referência ao checkout do Payment Module
  autoRenew: boolean;
  cancelledAt?: Date;
  suspendedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class Subscription extends Entity<SubscriptionProps> {
  get userId(): string;
  get planId(): string;
  get status(): SubscriptionStatus;
  get isActive(): boolean;
  get daysRemaining(): number;
  
  static create(props: SubscriptionProps, id?: UniqueEntityID): Result<Subscription>;
  
  activate(paymentId: string): Result<void>;
  cancel(): Result<void>;
  suspend(): Result<void>;
  renew(newEndDate: Date, paymentId: string): Result<void>;
  checkExpiration(): Result<void>; // atualiza status se expirado
}
```

**Regras de Negócio:**
1. Só pode ativar se status = TRIAL ou SUSPENDED
2. Só pode cancelar se status = ACTIVE ou TRIAL
3. endDate deve ser após startDate
4. Expiração automática quando Date.now() > endDate
5. Renovação só permitida para ACTIVE ou EXPIRED

**Testes obrigatórios (20+):**
- ✅ Criar assinatura válida
- ✅ Ativar assinatura com pagamento
- ✅ Cancelar assinatura ativa
- ✅ Suspender por falta de pagamento
- ✅ Renovar assinatura
- ✅ Verificar expiração automática
- ✅ Calcular dias restantes
- ✅ Validar transições de status

---

## 💼 Application Layer

### Use Cases

#### 1. CreateSubscriptionUseCase
```typescript
interface CreateSubscriptionRequest {
  userId: string;
  planId: string;
  paymentMethod: 'credit_card' | 'pix' | 'boleto';
  autoRenew?: boolean;
}

export class CreateSubscriptionUseCase {
  constructor(
    private subscriptionRepo: ISubscriptionRepository,
    private planRepo: IPlanRepository,
    private createCheckoutUseCase: CreateCheckoutUseCase, // do Payment Module
  ) {}

  async execute(request: CreateSubscriptionRequest): Promise<Result<SubscriptionResponseDTO>>;
}
```

**Fluxo:**
1. Verificar se usuário já tem assinatura ativa
2. Buscar plano por ID
3. Calcular endDate baseado no billing cycle
4. Criar entidade Subscription (status = TRIAL ou PENDING)
5. Criar checkout no Payment Module
6. Salvar subscription
7. Retornar subscription + checkoutUrl

**Testes (10+):**
- ✅ Criar assinatura com sucesso
- ✅ Falhar se usuário já tem assinatura ativa
- ✅ Falhar se plano não existe
- ✅ Falhar se plano está inativo
- ✅ Criar checkout no Payment Module
- ✅ Calcular endDate corretamente

#### 2. CancelSubscriptionUseCase
```typescript
interface CancelSubscriptionRequest {
  userId: string;
  reason?: string;
}

export class CancelSubscriptionUseCase {
  async execute(request: CancelSubscriptionRequest): Promise<Result<void>>;
}
```

**Fluxo:**
1. Buscar assinatura ativa do usuário
2. Validar se pode cancelar (status = ACTIVE ou TRIAL)
3. Chamar subscription.cancel()
4. Salvar no repositório

**Testes (8+):**
- ✅ Cancelar assinatura ativa
- ✅ Falhar se não tem assinatura
- ✅ Falhar se assinatura já cancelada
- ✅ Registrar motivo do cancelamento

#### 3. GetActiveSubscriptionUseCase
```typescript
interface GetActiveSubscriptionRequest {
  userId: string;
}

export class GetActiveSubscriptionUseCase {
  async execute(request: GetActiveSubscriptionRequest): Promise<Result<SubscriptionResponseDTO>>;
}
```

**Fluxo:**
1. Buscar subscription por userId
2. Verificar expiração
3. Retornar detalhes + plano associado

#### 4. UpgradeSubscriptionUseCase (Opcional/Avançado)
```typescript
interface UpgradeSubscriptionRequest {
  userId: string;
  newPlanId: string;
}

export class UpgradeSubscriptionUseCase {
  async execute(request: UpgradeSubscriptionRequest): Promise<Result<SubscriptionResponseDTO>>;
}
```

**Fluxo:**
1. Buscar assinatura atual
2. Validar novo plano
3. Calcular valor proporcional (pro-rata)
4. Criar novo checkout com diferença
5. Atualizar subscription com novo plano

---

## 🔧 Infrastructure Layer

### TypeORM Schemas

#### PlanSchema
```sql
CREATE TABLE plans (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(500) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  billing_cycle VARCHAR(50) NOT NULL,
  features JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  trial_days INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_plans_active ON plans(is_active);
CREATE INDEX idx_plans_billing_cycle ON plans(billing_cycle);
```

#### SubscriptionSchema
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  plan_id UUID NOT NULL REFERENCES plans(id),
  status VARCHAR(50) NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  last_payment_id VARCHAR(255),
  auto_renew BOOLEAN DEFAULT TRUE,
  cancelled_at TIMESTAMP,
  suspended_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_end_date ON subscriptions(end_date);
CREATE UNIQUE INDEX idx_subscriptions_active_user ON subscriptions(user_id) 
  WHERE status IN ('ACTIVE', 'TRIAL');
```

### Repositories

Implementar seguindo o padrão do Payment Module:
- `PlanRepository` com métodos: findById, findAll, findActive, save
- `SubscriptionRepository` com métodos: findById, findByUserId, findActiveByUserId, findExpired, save

---

## 🌐 Presentation Layer

### Endpoints

#### Plans
```
GET    /plans              - Lista todos os planos ativos
GET    /plans/:id          - Detalhes de um plano
POST   /plans              - Criar plano (admin only)
PATCH  /plans/:id          - Atualizar plano (admin only)
DELETE /plans/:id          - Desativar plano (admin only)
```

#### Subscriptions
```
POST   /subscriptions/subscribe        - Criar assinatura
GET    /subscriptions/me               - Assinatura ativa do usuário logado
POST   /subscriptions/cancel           - Cancelar assinatura
POST   /subscriptions/upgrade          - Fazer upgrade de plano
GET    /subscriptions/:id              - Detalhes de assinatura
```

#### Webhook (integração com Payment Module)
```
POST   /webhooks/subscription/payment  - Receber notificações de pagamento
```

**Fluxo Webhook:**
1. Payment Module recebe webhook do Asaas
2. Atualiza Checkout para CONFIRMED
3. Dispara evento: `PaymentConfirmedEvent`
4. Subscription Module escuta evento
5. Ativa/Renova subscription correspondente

---

## 🔗 Integração com Payment Module

### Event-Driven Architecture

```typescript
// Payment Module dispara evento
export class PaymentConfirmedEvent implements IDomainEvent {
  constructor(
    public readonly checkoutId: string,
    public readonly amount: number,
    public readonly userId: string,
  ) {}
}

// Subscription Module escuta evento
export class PaymentConfirmedHandler {
  constructor(
    private subscriptionRepo: ISubscriptionRepository,
  ) {}

  async handle(event: PaymentConfirmedEvent): Promise<void> {
    // Buscar subscription que criou esse checkout
    const subscription = await this.subscriptionRepo.findByLastPaymentId(event.checkoutId);
    
    if (subscription) {
      subscription.activate(event.checkoutId);
      await this.subscriptionRepo.save(subscription);
    }
  }
}
```

---

## ✅ Checklist de Implementação

### Domain Layer
- [ ] BillingCycle value object + 4 testes
- [ ] SubscriptionStatus value object + 4 testes
- [ ] Plan entity + 15 testes
- [ ] Subscription entity + 20 testes
- [ ] Interfaces de repositório

### Application Layer
- [ ] CreateSubscriptionUseCase + 10 testes
- [ ] CancelSubscriptionUseCase + 8 testes
- [ ] GetActiveSubscriptionUseCase + 6 testes
- [ ] UpgradeSubscriptionUseCase + 10 testes (opcional)
- [ ] DTOs (request/response)

### Infrastructure Layer
- [ ] PlanSchema TypeORM
- [ ] SubscriptionSchema TypeORM
- [ ] PlanRepository + testes
- [ ] SubscriptionRepository + testes
- [ ] Mappers + testes
- [ ] SubscriptionExpiryService (cron job)

### Presentation Layer
- [ ] PlanController + Swagger
- [ ] SubscriptionController + Swagger
- [ ] DTOs de request com validação
- [ ] JWT Guard

### Integração
- [ ] Event handler para PaymentConfirmedEvent
- [ ] Webhook listener
- [ ] Testes de integração end-to-end

### Documentação
- [ ] API docs (Swagger)
- [ ] Guia de teste
- [ ] Diagrama de fluxo

---

## 🎯 Requisitos Não-Funcionais

1. **Performance**: Queries otimizadas com índices
2. **Segurança**: JWT em todas as rotas, validação de ownership
3. **Testabilidade**: Cobertura > 90%
4. **DDD**: Lógica de negócio isolada no Domain Layer
5. **TDD**: Testes escritos ANTES da implementação
6. **SOLID**: Seguir princípios rigorosamente

---

## 📊 Casos de Uso de Negócio

### Cenário 1: Usuário Compra Plano Mensal
1. Frontend: `POST /subscriptions/subscribe { planId: "premium-monthly" }`
2. Backend: Cria Subscription (status=TRIAL)
3. Backend: Cria Checkout no Payment Module
4. Frontend: Redireciona para `checkoutUrl` (Asaas)
5. Usuário paga no Asaas
6. Asaas → Webhook → Payment Module
7. Payment Module → Event → Subscription Module
8. Subscription.status = ACTIVE, endDate = now + 30 dias

### Cenário 2: Assinatura Expira
1. Cron job diário: `SubscriptionExpiryService.checkExpiredSubscriptions()`
2. Para cada subscription com endDate < now:
   - subscription.checkExpiration()
   - status = EXPIRED
   - Enviar email de renovação
3. Salvar no banco

### Cenário 3: Upgrade de Plano
1. Usuário tem plano mensal (R$ 29.90)
2. Quer anual (R$ 299.90)
3. Sistema calcula proporcional (15 dias usados)
4. Cria checkout com diferença
5. Atualiza subscription com novo plano + endDate

---

## 🚀 Prioridades de Implementação

### Fase 1 - MVP (Essencial)
1. ✅ Domain Layer completo
2. ✅ CreateSubscriptionUseCase
3. ✅ CancelSubscriptionUseCase
4. ✅ GetActiveSubscriptionUseCase
5. ✅ Infrastructure básica (schemas, repos)
6. ✅ Controllers + Swagger
7. ✅ Integração com Payment Module

### Fase 2 - Melhorias
1. UpgradeSubscriptionUseCase
2. Trial gratuito
3. Cron job de expiração
4. Dashboard admin de planos

### Fase 3 - Avançado
1. Cupons de desconto
2. Planos personalizados
3. Métricas e analytics
4. Notificações por email

---

## 📚 Referências

- **Padrão já implementado**: `backend/src/modules/payment/`
- **DDD patterns**: Seguir exatamente o mesmo estilo
- **TDD**: Red-Green-Refactor
- **NestJS Docs**: https://docs.nestjs.com
- **TypeORM Relations**: https://typeorm.io/relations

---

## ⚠️ Importante

- **SEGUIR RIGOROSAMENTE** os padrões DDD/TDD já estabelecidos
- **NÃO misturar** lógica de negócio com infraestrutura
- **ESCREVER TESTES** antes da implementação
- **USAR** Result pattern para tratamento de erros
- **ADICIONAR** `import { describe, it, expect, beforeEach, jest } from '@jest/globals';` em TODOS os arquivos .spec.ts

---

## 🎓 Prompt Final para IA

"Implemente o Subscription Module seguindo EXATAMENTE a estrutura e padrões descritos neste documento. Use DDD rigoroso com Domain, Application, Infrastructure e Presentation layers. Siga TDD escrevendo testes primeiro. Integre com o Payment Module existente via eventos. Mantenha cobertura de testes > 90%. Cada entidade deve ter 15+ testes, cada use case 6+ testes."
