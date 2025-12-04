# FinEx - Sistema de Gestão Financeira e Valuation

Sistema completo de gestão financeira, análise de maturidade de negócios e valuation para empresários e investidores.

## Stack Tecnológica

### Backend
- **Framework**: NestJS
- **Linguagem**: TypeScript
- **Banco de Dados**: PostgreSQL (migração futura para DuckDB)
- **Cache**: Redis
- **Autenticação**: JWT

### Frontend (Planejado)
- **Framework**: React com Next.js
- **Linguagem**: TypeScript
- **Styling**: TailwindCSS

### DevOps
- **Cloud**: AWS (VM)
- **Web Server**: Nginx
- **Containerização**: Docker (planejado)

## Arquitetura

Este projeto segue:
- **Domain-Driven Design (DDD)**
- **Clean Architecture**
- **Test-Driven Development (TDD)**

## Estrutura do Projeto

```
finex/
├── frontend/                 # (Reservado para o futuro Next.js/React)
│
├── backend/                  # API NestJS
│   ├── src/
│   │   ├── shared/           # O "Kernel" (Ferramentas base para todos os módulos)
│   │   │   ├── core/         # Classes Abstratas do DDD
│   │   │   │   ├── entity.ts             # Classe Base de Entidade
│   │   │   │   ├── value-object.ts       # Classe Base de Value Object
│   │   │   │   ├── result.ts             # Padrão de tratamento de erros
│   │   │   │   ├── unique-entity-id.ts   # Gerador de UUID
│   │   │   │   └── use-case.interface.ts # Contrato genérico de Use Cases
│   │   │   │
│   │   │   ├── domain/       # Interfaces de domínio compartilhadas
│   │   │   │   └── events/   # DomainEvents, Handle, DomainEventPublisher
│   │   │   │
│   │   │   └── infra/        # Utilitários técnicos globais
│   │   │       ├── http/     # Interceptors, Decorators globais
│   │   │       └── env/      # Configuração de variáveis de ambiente
│   │   │
│   │   ├── modules/          # Onde seus contextos viverão
│   │   │   │
│   │   │   └── __nome-do-modulo__/   # <--- ESSE É O TEMPLATE PADRÃO
│   │   │       │
│   │   │       ├── domain/           # CAMADA 1: Regras e Entidades (Pura)
│   │   │       │   ├── entities/     # Agregados e Entidades
│   │   │       │   ├── value-objects/# Objetos de Valor (Email, CPF, Money)
│   │   │       │   ├── events/       # Eventos disparados (Ex: Created, Updated)
│   │   │       │   └── ports/        # Interfaces (Contratos para Repositórios e Serviços)
│   │   │       │
│   │   │       ├── application/      # CAMADA 2: Casos de Uso (Orquestração)
│   │   │       │   ├── use-cases/    # Lógica de escrita (Create, Update)
│   │   │       │   ├── queries/      # Lógica de leitura (Get, List)
│   │   │       │   ├── dtos/         # Contratos de entrada/saída de dados
│   │   │       │   └── subscribers/  # Listeners de eventos (Side effects)
│   │   │       │
│   │   │       ├── infrastructure/   # CAMADA 3: Implementação Técnica
│   │   │       │   ├── persistence/  # Banco de Dados
│   │   │       │   │   └── typeorm/
│   │   │       │   │       ├── entities/     # Schemas do banco (Tabelas)
│   │   │       │   │       ├── mappers/      # Conversores (Domain <-> Schema)
│   │   │       │   │       └── repositories/ # Implementação dos Ports
│   │   │       │   ├── adapters/     # Serviços Externos (APIs, Email, Storage)
│   │   │       │   └── module.ts     # Definição do Módulo NestJS (Providers/Exports)
│   │   │       │
│   │   │       └── presentation/     # CAMADA 4: Pontos de Entrada
│   │   │           ├── http/         # Controllers REST
│   │   │           │  ├── controllers/
│   │   │           │  └── view-models/  # Formatação de resposta JSON
│   │   │           └── cron/         # Agendamentos (se houver)
│   │   │
│   │   ├── app.module.ts     # Módulo Raiz
│   │   └── main.ts           # Arquivo de entrada
│   │
│   ├── test/                 # Testes e2e (Ponta a Ponta)
│   ├── .env                  # Variáveis de ambiente
│   ├── package.json
│   └── tsconfig.json
```

## Funcionalidades

### Autenticação e Autorização
- [x] Sistema de Login
- [x] Controle de Permissões (Admin, Empresário, Investidor)
- [ ] Recuperação de Senha
- [ ] Autenticação de 2 fatores

### Gestão Financeira
- [ ] Importação de Fluxo de Caixa (CSV/XLSX)
- [ ] Importação de Contas a Pagar/Receber
- [ ] Validação automática de dados
- [ ] Dashboards financeiros

### Análise de Negócio
- [ ] Avaliação de maturidade de negócio
- [ ] Score de Maturidade
- [ ] Rating de Equity
- [ ] Painel de Valuation
- [ ] Análise de "Valor Invisível"
- [ ] Recomendações de Spin-offs

### Inteligência Artificial
- [ ] Agente de IA para análise de dados
- [ ] Recomendações automáticas

### Extras
- [ ] Integrações externas
- [ ] Help Desk
- [ ] Agenda de eventos
- [ ] Área de entregáveis

## Segurança

- Autenticação via JWT
- Criptografia de dados sensíveis
- Isolamento de tenants (multi-tenant)
- Controle granular de acessos

## Escalabilidade

Sistema preparado para:
- 100-500 empresas inicialmente
- Arquitetura modular e escalável
- Cache com Redis
- Possibilidade de microserviços futuros

## Começando

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Configurar variáveis de ambiente
npm run start:dev
```

### Testes

```bash
npm run test
npm run test:cov
npm run test:e2e
```

## Documentação

Cada módulo possui sua própria documentação:
- [Backend](./backend/README.md)
- [Frontend](./frontend/README.md) (em desenvolvimento)

## Padrões de Código

- Nomes de arquivos e pastas em **inglês**
- Commits semânticos
- Code review obrigatório
- Cobertura de testes > 80%

## Licença

Proprietary - Todos os direitos reservados
